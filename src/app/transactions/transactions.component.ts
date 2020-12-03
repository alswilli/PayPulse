import {Component, OnInit, ViewChild, Injectable} from '@angular/core';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource, MatTable} from '@angular/material/table';
import {MatFormFieldModule} from '@angular/material/form-field';
import {TransactionService} from '../services/transaction.service';
import {Transaction} from '../shared/transaction';
import { LoginComponent } from '../login/login.component';
import {AccountService} from '../services/account.service';
import {Account} from '../shared/account';
import {forkJoin, merge, Observable, of as observableOf} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';
import { MatSelectionList, MatSelectionListChange } from '@angular/material';

import {SelectionModel} from '@angular/cdk/collections';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {BehaviorSubject} from 'rxjs';

/**
 * Node for to-do item
 */
export class TodoItemNode {
  children: TodoItemNode[];
  item: string;
}

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
  item: string;
  level: number;
  expandable: boolean;
}

/**
 * The Json object for to-do list data.
 */

// const TREE_DATA = {
//   Groceries: {
//     'Almond Meal flour': null,
//     'Organic eggs': null,
//     'Protein Powder': null,
//     Fruits: {
//       Apple: null,
//       Berries: ['Blueberry', 'Raspberry'],
//       Orange: null
//     }
//   },
//   Reminders: [
//     'Cook dinner',
//     'Read the Material Design spec',
//     'Upgrade Application to Angular'
//   ]
// };

var TREE_DATA = {};

/**
 * Checklist database, it can build a tree structured Json object.
 * Each node in Json object represents a to-do item or a category.
 * If a node is a category, it has children items and new items can be added under the category.
 */
@Injectable()
export class ChecklistDatabase {
  dataChange = new BehaviorSubject<TodoItemNode[]>([]);

  get data(): TodoItemNode[] { return this.dataChange.value; }

  constructor() {
    this.initialize();
  }

  initialize() {
    // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
    //     file node as children.
    var data = this.buildFileTree(TREE_DATA, 0);

    // Notify the change.
    this.dataChange.next(data);
  }

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `TodoItemNode`.
   */
  buildFileTree(obj: object, level: number): TodoItemNode[] {
    return Object.keys(obj).reduce<TodoItemNode[]>((accumulator, key) => {
      const value = obj[key];
      const node = new TodoItemNode();
      node.item = key;

      if (value != null) {
        if (typeof value === 'object') {
          node.children = this.buildFileTree(value, level + 1);
        } else {
          node.item = value;
        }
      }

      return accumulator.concat(node);
    }, []);
  }

  /** Add an item to to-do list */
  insertItem(parent: TodoItemNode, name: string) {
    if (parent.children) {
      parent.children.push({item: name} as TodoItemNode);
      this.dataChange.next(this.data);
    }
  }

  updateItem(node: TodoItemNode, name: string) {
    node.item = name;
    this.dataChange.next(this.data);
  }
}

export interface TransactionData {
  amount: string;
  transactionName: string;
  category: string;
  date: string;
}

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
  providers: [ChecklistDatabase]
})
export class TransactionsComponent implements OnInit {

  displayedColumns: string[] = ['bankAccountName', 'subAccountName', 'amount', 'transactionName', 'category', 'date'];
  dataSource: MatTableDataSource<TransactionData>;
  transactions: Transaction[] = [];
  accounts: Account[];
  errMess: string;
  totalPosts: number = 0;
  userAccounts: Account[];
  userAccountsDetails;
  currentAccountIds: string[] = [];
  postsPerPage = 10;
  currentPage = 1;
  adjustedPage: number;
  pageSizeOptions = [10, 25, 50, 100];
  isLoading = false;
  subAccount: string;
  subAccountId: string;
  subAccountsDict: any;
  balancesAvailableDict: any;
  balancesCurrentDict: any;
  currentAccounts: any[];
  parentNodes = {}
  doNotDeleteDict = {};


  listValue: any = [];
  preSelection = [];

  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: TodoItemFlatNode | null = null;

  /** The new item's name */
  newItemName = '';

  treeControl: FlatTreeControl<TodoItemFlatNode>;

  treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;

  treeDataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);

  // actualPaginator: MatPaginator;
  // @ViewChild(MatPaginator)
  // set paginator(value: MatPaginator) {
  //   this.actualPaginator = value;
  // }

  @ViewChild(MatPaginator, {read: true}) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatSelectionList) selectionList: MatSelectionList;
  parsedTransactions: any[];
  totalCurrent: number;
  activeCurrents = {};
  activeSubs = {};
  subAccountsLength: number;
  activeSubsLength: number;
  activeCurrentsLength: number;

  constructor(private accountService: AccountService,
    private database: ChecklistDatabase) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
    this.treeDataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    database.dataChange.subscribe(data => {
      this.treeDataSource.data = data;
    });
  }

  ngOnInit() {
    this.isLoading = true;
    console.log("ngInit");

    this.userAccountsDetails = JSON.parse(localStorage.getItem('User Accounts Details'));
    console.log("Current Account Details: ", this.userAccountsDetails)
    this.accounts = this.userAccountsDetails.accounts;
    this.currentAccounts = this.userAccountsDetails.currentAccounts;
    for (let account of this.currentAccounts) {
      this.currentAccountIds.push(account._id);
    }
    console.log("Current Account Ids: ", this.currentAccountIds);
    this.postsPerPage *= this.currentAccountIds.length
    for (let opt of this.pageSizeOptions) {
      opt *= this.currentAccountIds.length
    }

    this.subAccount = 'All';
    this.subAccountId = null;
    this.subAccountsDict = {};
    this.balancesAvailableDict = {};
    this.balancesCurrentDict = {};
    TREE_DATA = {}
    this.subAccountsLength = 0
    for (let account of this.currentAccounts) {
      console.log("A");
      TREE_DATA[account.institutionName] = []
      this.subAccountsDict[account.institutionName] = {}
      this.doNotDeleteDict[account.institutionName] = {}
      this.activeCurrents[account.institutionName] = null
      this.balancesAvailableDict[account.institutionName] = {}
      this.balancesCurrentDict[account.institutionName] = {}
      for (let subAcc of account.subAccounts) {
        console.log("B");
        TREE_DATA[account.institutionName].push(subAcc.name)
        this.subAccountsLength += 1
        // console.log(subAcc.name);
        // console.log(subAcc.account_id);
        // console.log(this.subAccountsDict);
        this.subAccountsDict[account.institutionName][subAcc.name] = subAcc.account_id;
        this.doNotDeleteDict[account.institutionName][subAcc.name] = subAcc.account_id;
        this.activeSubs[account.institutionName + subAcc.name] = null
        this.balancesAvailableDict[account.institutionName][subAcc.name] = subAcc.balances.available;
        this.balancesCurrentDict[account.institutionName][subAcc.name] = subAcc.balances.current;
      }
    }
    this.activeSubsLength = Object.keys(this.activeSubs).length
    this.activeCurrentsLength = Object.keys(this.activeCurrents).length
    console.log(TREE_DATA)
    this.database.initialize();

    var index = 0
    for (let node of this.treeControl.dataNodes) {
      if (node.item in this.subAccountsDict) {
        this.todoItemSelectionToggle(node) // MONEY
      }
      if (node.level == 0) {
        this.parentNodes[String(index)] = node
      }
      index += 1
    }
    console.log("C");

    // for (let key in this.balancesCurrentDict) {
    //   var currVal = String(this.balancesCurrentDict[key])
    //   var i = currVal.indexOf(".");
    //   console.log("Curr val: ", currVal)
    //   if (i > -1 && i + 3 < currVal.length) {
    //     this.balancesCurrentDict[key] = Number(currVal.substring(0, i+3));
    //   }
    //   else if (i + 2 == currVal.length) {
    //     this.balancesCurrentDict[key] = Number(currVal.substring(0, i+2) + "0");
    //   }
    // }

    this.totalCurrent = 0;
    for (let key in this.balancesCurrentDict) {
      for (let subkey in this.balancesCurrentDict[key]) {
        this.totalCurrent = this.roundNumber( this.totalCurrent + this.balancesCurrentDict[key][subkey], 2 );
      }
    }
    // this.totalCurrent = this.roundTotalCurrent(this.totalCurrent)
    // console.log(totalAvailable);
    console.log("Total Current: ", this.totalCurrent);
    console.log('Current Page: ', this.currentPage);
    this.adjustedPage = this.currentPage-1;
    // Now get the currentAccount transactions
    let accountObservables: Observable<any>[] = [];
    for (let currAccount of this.currentAccounts) {
      var subAccountIds = [];
      for (let subAccount of currAccount.subAccounts) { 
        subAccountIds.push(subAccount.account_id)
      }
      console.log(subAccountIds)
      accountObservables.push(this.accountService.getTransactions(currAccount._id, (this.postsPerPage / this.currentAccountIds.length), this.currentPage, subAccountIds))
    }
    forkJoin(accountObservables)
    // Now get the currentAccount transactions
      .subscribe(transactionsArray => {
        console.log(transactionsArray)
        // this.isLoading = false;
        // this.firstLoad = false;
        console.log("Inside Transactions")
        this.isLoading = false;
        this.transactions = [];
        for (let res of transactionsArray) {
          if (res.transactions != null) {
            for (let transaction of res.transactions) {
              this.transactions.push(transaction)
            }
            this.totalPosts += res.maxTransactions; 
          }
        } 
        // this.transactions.forEach(element => {
        //   console.log(element);
        // });
        console.log(this.totalPosts)
        this.parsedTransactions = [];
        for (let entry of this.transactions) {
          var currAccountName = null;
          var currMainAccountName = null;
          // Translate account_id to account name
          var found = false
          for (let account of this.currentAccounts) {
            for (let subAcc of account.subAccounts) {
              if (subAcc.account_id === entry.account_id) {
                currAccountName = subAcc.name;
                found = true
                break;
              }
            }
            if (found) {
              currMainAccountName = account.institutionName;
              break;
            }
          }
          const newTransaction = {
            amount: entry.amount,
            transactionName: entry.transactionName,
            category: entry.category,
            date: entry.date,
            subAccountName: currAccountName,
            bankAccountName: currMainAccountName
          };
          this.parsedTransactions.push(newTransaction);
        }
        this.parsedTransactions.sort(this.compareTransactions)
        // this.parsedTransactions.sort(this.compareTransactions)
        // if (this.parsedTransactions.length > 3) {
        //   this.parsedTransactions = this.parsedTransactions.slice(0, 3)
        // }

        // Assign the data to the data source for the table to render
        // this.dataSource = new MatTableDataSource(users);
        console.log("Paginator: ", this.paginator);
        this.dataSource = new MatTableDataSource(this.parsedTransactions);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        console.log("Data Source: ", this.dataSource);

        // this.selectionList.selectionChange.subscribe((s: MatSelectionListChange) => {     
        //   console.log("yup")
        //   this.selectionList.deselectAll();
        //   console.log(s);
        //   s.option.selected = true;
        // });
    });
  }

  compareTransactions(a,b) {
    if (new Date(a.date) >= new Date(b.date)) //push more recent dates to front
       return -1;
    if (new Date(a.date) < new Date(b.date)) //if equal then use one that is further down user goals list
      return 1;
  }

  roundTotalCurrent(val) {
    var currVal = String(val)
    var i = currVal.indexOf(".");
    if (i > -1 && i + 3 < currVal.length) {
      val = Number(currVal.substring(0, i+3));
    }
    else if (i + 2 == currVal.length) {
      val = Number(currVal.substring(0, i+2) + "0");
      console.log(currVal.substring(0, i+2) + "0")
    }
    return val
  }

  roundNumber(number, decimals) {
    var newnumber = new Number(number+'').toFixed(parseInt(decimals));
    return parseFloat(newnumber); 
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onChangedPage(pageData: PageEvent) {
    console.log(pageData);
    console.log("onChangedPage");
    this.isLoading = true;
    if (pageData) {
      this.currentPage = pageData.pageIndex+1;
      this.postsPerPage = pageData.pageSize;
    }
    let accountObservables: Observable<any>[] = [];
    for (let currAccount of this.currentAccounts) {
      var subAccountIds = [];
      for (let subAccount in this.subAccountsDict[currAccount.institutionName]) { 
        if (this.subAccountsDict[currAccount.institutionName][subAccount] != null) {
          subAccountIds.push(this.subAccountsDict[currAccount.institutionName][subAccount])
        }
      }
      console.log(subAccountIds)
      if (subAccountIds.length > 0) {
        accountObservables.push(this.accountService.getTransactions(currAccount._id, (this.postsPerPage / Object.keys(this.activeCurrents).length), this.currentPage, subAccountIds))
      }
    }
    if (accountObservables.length == 0) {
      this.dataSource.data = [];
      this.isLoading = false;
    }
    else {
      forkJoin(accountObservables)
      // Now get the currentAccount transactions
        .subscribe(transactionsArray => {
          console.log(transactionsArray)
          // this.isLoading = false;
          // this.firstLoad = false;
          console.log("Inside Transactions")
          this.isLoading = false;
          this.adjustedPage = this.currentPage-1;
          this.transactions = [];
          this.totalPosts = 0
          for (let res of transactionsArray) {
            if (res.transactions != null) {
              for (let transaction of res.transactions) {
                this.transactions.push(transaction)
              }
              this.totalPosts += res.maxTransactions; 
            }
          } 
          // this.transactions.forEach(element => {
          //   console.log(element);
          // });
          console.log(this.totalPosts)
          this.parsedTransactions = [];
          for (let entry of this.transactions) {
            var currAccountName = null;
            var currMainAccountName = null;
            // Translate account_id to account name
            var found = false
            for (let account of this.currentAccounts) {
              for (let subAcc of account.subAccounts) {
                if (subAcc.account_id === entry.account_id) {
                  currAccountName = subAcc.name;
                  found = true
                  break;
                }
              }
              if (found) {
                currMainAccountName = account.institutionName;
                break;
              }
            }
            const newTransaction = {
              amount: entry.amount,
              transactionName: entry.transactionName,
              category: entry.category,
              date: entry.date,
              subAccountName: currAccountName,
              bankAccountName: currMainAccountName
            };
            this.parsedTransactions.push(newTransaction);
          }
          this.parsedTransactions.sort(this.compareTransactions)
          console.log("Parsed transactions: "+ this.parsedTransactions);
  
          // Assign the data to the data source for the table to render
          // this.dataSource = new MatTableDataSource(users);
          console.log("Data Source: ", this.dataSource);
  
          this.dataSource.data = this.parsedTransactions;
  
          // this.table.renderRows();
          // this.dataSource.paginator = this.actualPaginator;
          console.log("Data Source: ", this.dataSource);
          // this.dataSource.sort = this.sort;
        })
    }
  }

  onSubAccountsChanged(accountName, parentNode, descendants, toAdd) {
    if (parentNode != null) {
      if (toAdd) {
        console.log("Adding one subaccount")
        if (!((parentNode.item + accountName) in this.activeSubs)) {
          // this.totalCurrent += this.roundTotalCurrent(this.balancesCurrentDict[parentNode.item][accountName])
          // this.totalCurrent += this.balancesCurrentDict[parentNode.item][accountName]
          this.totalCurrent = this.roundNumber( this.totalCurrent + this.balancesCurrentDict[parentNode.item][accountName], 2 );
        }
        this.subAccountsDict[parentNode.item][accountName] = this.doNotDeleteDict[parentNode.item][accountName]
        this.activeSubs[parentNode.item + accountName] = null
      }
      else {
        console.log("Removing one subaccount")
        if ((parentNode.item + accountName) in this.activeSubs) {
          // this.totalCurrent -= this.roundTotalCurrent(this.balancesCurrentDict[parentNode.item][accountName])
          // this.totalCurrent -= this.balancesCurrentDict[parentNode.item][accountName]
          this.totalCurrent = this.roundNumber( this.totalCurrent - this.balancesCurrentDict[parentNode.item][accountName], 2 );
        }
        this.subAccountsDict[parentNode.item][accountName] = null
        delete this.activeSubs[parentNode.item + accountName]
      }
    }
    else {
      if (toAdd) {
        console.log("Adding all subaccounts from bank account")
        for (let subAccount in this.subAccountsDict[accountName]) {
          if (!((accountName + subAccount) in this.activeSubs)) {
            // this.totalCurrent += this.roundTotalCurrent(this.balancesCurrentDict[accountName][subAccount])
            // this.totalCurrent += this.balancesCurrentDict[accountName][subAccount]
            this.totalCurrent = this.roundNumber( this.totalCurrent + this.balancesCurrentDict[accountName][subAccount], 2 );
          }
          this.subAccountsDict[accountName][subAccount] = this.doNotDeleteDict[accountName][subAccount]
          this.activeSubs[accountName + subAccount] = null
        }
        this.activeCurrents[accountName] = null
      }
      else {
        console.log("Removing all subaccounts from bank account")
        for (let subAccount in this.subAccountsDict[accountName]) {
          if ((accountName + subAccount) in this.activeSubs) {
            // this.totalCurrent -= this.roundTotalCurrent(this.balancesCurrentDict[accountName][subAccount])
            // this.totalCurrent -= this.balancesCurrentDict[accountName][subAccount]
            this.totalCurrent = this.roundNumber( this.totalCurrent - this.balancesCurrentDict[accountName][subAccount], 2 );
          }
          this.subAccountsDict[accountName][subAccount] = null
          delete this.activeSubs[accountName + subAccount]
        }
        delete this.activeCurrents[accountName]
      }
    }
    // this.totalCurrent = this.roundTotalCurrent(this.totalCurrent)
    this.activeSubsLength = Object.keys(this.activeSubs).length
    this.activeCurrentsLength = Object.keys(this.activeCurrents).length
    this.currentPage = 1;
    // this.dataSource.paginator.firstPage();
    console.log(this.activeCurrents)
    this.onChangedPage(null)
  }

  sortData(event) {
    console.log(event);
  }
  

  getLevel = (node: TodoItemFlatNode) => node.level;

  isExpandable = (node: TodoItemFlatNode) => node.expandable;

  getChildren = (node: TodoItemNode): TodoItemNode[] => node.children;

  hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: TodoItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item
        ? existingNode
        : new TodoItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = !!node.children;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  /** Whether all the descendants of the node are selected */
  descendantsAllSelected(node: TodoItemFlatNode): boolean {
    // console.log("full")
    const descendants = this.treeControl.getDescendants(node);
    return descendants.some(child => this.checklistSelection.isSelected(child));
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
    // console.log("partial")
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: TodoItemFlatNode): void {
    console.log("toggle")
    console.log(node)
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    var nodeIndex = this.treeControl.dataNodes.indexOf(node)
    var prev = null
    var parentNode = null
    if (descendants.length == 0) {
      for (let key in this.parentNodes) {
        if (Number(key) > nodeIndex) {
          parentNode = this.parentNodes[prev]
        }
        prev = Number(key)
      }
      if (parentNode == null) {
        parentNode = this.parentNodes[prev]
      }
    }
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);
    if(this.dataSource != null) {
      this.onSubAccountsChanged(node.item, parentNode, descendants, this.checklistSelection.isSelected(node));
    }
  }

  /** Select the category so we can insert the new item. */
  addNewItem(node: TodoItemFlatNode) {
    const parentNode = this.flatNodeMap.get(node);
    this.database.insertItem(parentNode!, '');
    this.treeControl.expand(node);
  }

  /** Save the node to database */
  saveNode(node: TodoItemFlatNode, itemValue: string) {
    const nestedNode = this.flatNodeMap.get(node);
    this.database.updateItem(nestedNode!, itemValue);
  }

}


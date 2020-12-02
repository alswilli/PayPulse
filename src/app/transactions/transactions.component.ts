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
import {merge, Observable, of as observableOf} from 'rxjs';
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
  transactions: Transaction[];
  accounts: Account[];
  errMess: string;
  totalPosts: number;
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

    this.subAccount = 'All';
    this.subAccountId = null;
    this.subAccountsDict = {};
    this.balancesAvailableDict = {};
    this.balancesCurrentDict = {};
    TREE_DATA = {}
    for (let account of this.currentAccounts) {
      console.log("A");
      TREE_DATA[account.institutionName] = []
      this.subAccountsDict[account.institutionName] = {}
      this.balancesAvailableDict[account.institutionName] = {}
      this.balancesCurrentDict[account.institutionName] = {}
      for (let subAcc of account.subAccounts) {
        console.log("B");
        TREE_DATA[account.institutionName].push(subAcc.name)
        // console.log(subAcc.name);
        // console.log(subAcc.account_id);
        // console.log(this.subAccountsDict);
        this.subAccountsDict[account.institutionName][subAcc.name] = subAcc.account_id;
        this.balancesAvailableDict[account.institutionName][subAcc.name] = subAcc.balances.available;
        this.balancesCurrentDict[account.institutionName][subAcc.name] = subAcc.balances.current;
      }
    }
    console.log(TREE_DATA)
    this.database.initialize();

    this.todoItemSelectionToggle(this.treeControl.dataNodes[0]) // MONEY
    console.log("C");

    var totalCurrent = 0;
    for (let key in this.balancesCurrentDict) {
      totalCurrent = totalCurrent + this.balancesCurrentDict[key];
    }
    // console.log(totalAvailable);
    console.log("Total Current: ", totalCurrent);
    this.balancesCurrentDict['All'] = totalCurrent;

    for (let key in this.balancesCurrentDict) {
      var currVal = String(this.balancesCurrentDict[key])
      var i = currVal.indexOf(".");
      console.log("Curr val: ", currVal)
      if (i > -1 && i + 3 < currVal.length) {
        this.balancesCurrentDict[key] = Number(currVal.substring(0, i+3));
      }
    }

    console.log("List Value: ", this.listValue);
    console.log('Current Page: ', this.currentPage);
    this.adjustedPage = this.currentPage-1;
    // Now get the currentAccount transactions
    this.accountService.getTransactions(this.currentAccountIds[0], this.postsPerPage, this.currentPage, this.subAccount, this.subAccountId)
    .subscribe(res => {
      console.log(res);
      this.isLoading = false;
      this.transactions = res.transactions;
      this.totalPosts = res.maxTransactions;
      for (let entry of this.transactions) {
        console.log(entry);
      }
      const parsedTransactions = [];
      var currAccountName;
      for (let entry of this.transactions) {
        // Translate account_id to account name
        for (let account of this.currentAccounts) {
          for (let subAcc of account.subAccounts) {
            if (subAcc.account_id === entry.account_id) {
              currAccountName = subAcc.name;
              break;
            }
          }
        }
        const newTransaction = {
          amount: entry.amount,
          transactionName: entry.transactionName,
          category: entry.category,
          date: entry.date,
          subAccountName: currAccountName,
          bankAccountName: 'test'
        };
        parsedTransactions.push(newTransaction);
      }
      console.log("Parsed transactions: "+ parsedTransactions);

      // Assign the data to the data source for the table to render
      // this.dataSource = new MatTableDataSource(users);
      console.log("Paginator: ", this.paginator);
      this.dataSource = new MatTableDataSource(parsedTransactions);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      console.log("Data Source: ", this.dataSource);

      this.selectionList.selectionChange.subscribe((s: MatSelectionListChange) => {     
        console.log("yup")
        this.selectionList.deselectAll();
        console.log(s);
        s.option.selected = true;
      });
    },
      errmess => this.errMess = <any>errmess);
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
    this.accountService.getTransactions(this.currentAccountIds[0], this.postsPerPage, this.currentPage, this.subAccount, this.subAccountId)
      .subscribe(res => {
        console.log(res)
        this.isLoading = false;
        this.adjustedPage = this.currentPage-1;
        this.transactions = res.transactions;
        this.totalPosts = res.maxTransactions;
        for (let entry of this.transactions) {
          console.log(entry);
        }
        const parsedTransactions = [];
        var currAccountName;
        for (let entry of this.transactions) {
          // Translate account_id to account name
          for (let account of this.currentAccounts) {
            for (let subAcc of account.subAccounts) {
              if (subAcc.account_id === entry.account_id) {
                currAccountName = subAcc.name;
                break;
              }
            }
          }
          const newTransaction = {
            amount: entry.amount,
            transactionName: entry.transactionName,
            category: entry.category,
            date: entry.date,
            subAccountName: currAccountName,
            bankAccountName: 'test'
          };
          parsedTransactions.push(newTransaction);
        }
        console.log("Parsed transactions: "+ parsedTransactions);

        // Assign the data to the data source for the table to render
        // this.dataSource = new MatTableDataSource(users);
        console.log("Data Source: ", this.dataSource);

        this.dataSource.data = parsedTransactions;

        // this.table.renderRows();
        // this.dataSource.paginator = this.actualPaginator;
        console.log("Data Source: ", this.dataSource);
        // this.dataSource.sort = this.sort;
      },
        errmess => this.errMess = <any>errmess);
  }

  onSubAccountChanged(accountName) {
    console.log("Sub Account: ", accountName);
    this.subAccount = accountName;
    console.log(this.subAccountsDict);
    this.subAccountId = this.subAccountsDict[this.subAccount];
    console.log(this.subAccount);
    console.log(this.subAccountId);
    this.currentPage = 1;
    // this.dataSource.paginator.firstPage();

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
    const descendants = this.treeControl.getDescendants(node);
    return descendants.every(child => this.checklistSelection.isSelected(child));
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: TodoItemFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);
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


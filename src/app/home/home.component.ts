import { Component, OnInit, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import { MajorComponent } from '../shared/majorComponent';
import { MAJORS } from '../shared/majorComponents';
import {TransactionService} from '../services/transaction.service';
import {Transaction} from '../shared/transaction';
import {AccountService} from '../services/account.service';
import {Account} from '../shared/account';
import { MatSelectionList, MatSelectionListChange, MatListOption, MatDialog } from '@angular/material';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { switchMap, flatMap, mergeMap, subscribeOn } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { DeleteAccountComponent } from '../delete-account/delete-account.component';
import { ErrorComponent } from '../error/error.component';
import { BudgetService } from '../services/budget.service';
import { Budget } from '../shared/budget';
import { Stringifiable } from 'd3';
import { GoalsComponent } from '../goals/goals.component';
import { Goal } from '../shared/goal';
import { baseURL } from '../shared/baseurl';
import { PlaidLinkHandler } from 'ngx-plaid-link/lib/ngx-plaid-link-handler';
import { PlaidConfig } from 'ngx-plaid-link/lib/interfaces';
import { NgxPlaidLinkService } from 'ngx-plaid-link';
import { Observable, forkJoin, of } from 'rxjs';
import { GoalService } from '../services/goal.service';
import { UserGoal } from '../shared/usergoal';
// import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {

  @ViewChild(MatSelectionList) selectionList: MatSelectionList;

  majorComponents: MajorComponent[] = MAJORS;
  recentTransactions: any[] = [];
  parsedTransactions: Object[];
  userAccountsDetails: any;
  accounts: any;
  currentAccounts: any[] = [];
  currentAccountOption: MatListOption;
  currentAccountIds: string[] = [];
  currentAccountNames: string[] = [];
  userAccountsIds: string[] = [];
  errMess: string;
  isLoading = false;
  removeAccounts = false;
  firstLoad = false;
  fullLoad = false;
  categories: any;
  budgets: Budget[];
  days = 30;
  subdays = 0;
  transactions: any[] = [];
  top3Budgets = [];
  marginVal: string;
  borderVal: string;
  recentlyCompletedUserGoals: UserGoal[];
  recentlyCompletedGoals: Goal[];

  clientForm: FormGroup;
  listValue: any = [];
  preSelection = [];
  environment: string;
  linkToken: string = null;
  publicToken: string = null;

  private plaidLinkHandler: PlaidLinkHandler;
  private updatePlaidLinkHandlers: PlaidLinkHandler[] = [];

  private config: PlaidConfig = {
    apiVersion: "v2",
    env: "sandbox",
    token: null,
    webhook: "https://507ec71083932519eb6c52a27bbe8afd.m.pipedream.net",
    product: ["auth", "transactions"],
    countryCodes: ['US', 'CA', 'GB'],
    key: "ea1ee62219264cf290c12041f96bba",
    onSuccess: this.onSuccess,
    onExit: this.onExit
  };
  i: any;
  userGoalsDetails: any;
  allGoals: any;
  allUserGoals: any;

  constructor(private transactionService: TransactionService,
    private accountService: AccountService,
    private authService: AuthService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private budgetService: BudgetService,
    private plaidLinkService: NgxPlaidLinkService,
    private goalService: GoalService) { }
    

  ngOnChanges(changes: SimpleChanges) {
    console.log("CHANGE: ", changes)
  }

  ngOnInit() {
    this.isLoading = true;
    this.plaidLinkService
      .createPlaid(
        Object.assign({}, this.config, {
          onSuccess: (token, metadata) => this.onSuccess(token, metadata),
          onExit: (error, metadata) => this.onExit(error, metadata),
          onEvent: (eventName, metadata) => this.onEvent(eventName, metadata)
        })
      )
      .then((handler: PlaidLinkHandler) => {
        this.plaidLinkHandler = handler;
        // this.open();
      });
    this.recentlyCompletedUserGoals = [];
    this.recentlyCompletedGoals = [];
    this.userAccountsDetails = JSON.parse(localStorage.getItem('User Accounts Details'));
    console.log(this.userAccountsDetails)
    this.userGoalsDetails = JSON.parse(localStorage.getItem('User Goals Details'));
    this.allGoals = this.userGoalsDetails.goals;
    this.allUserGoals = this.userGoalsDetails.usergoals;

    // if (this.userAccountsDetails.accounts.length > 1) {
    //   this.listValue.push(['All', true]);
    // }

    this.accounts = this.userAccountsDetails.accounts;
    this.currentAccounts = this.userAccountsDetails.currentAccounts;

    for (let account of this.accounts) {
      this.listValue.push([account.institutionName, account.itemValid]);
      this.updatePlaidLinkHandlers.push(null)
    }

    console.log("List Value: ", this.listValue);
    console.log("Current Accounts: ", this.currentAccounts);

    if (this.listValue.length > 0 && this.currentAccounts.length > 0) {
      for (let account of this.currentAccounts) {
        this.currentAccountIds.push(account._id);
        this.currentAccountNames.push(account.institutionName)
        this.preSelection.push(account.institutionName)
      } 
      console.log(this.preSelection);
      this.marginVal = '10';
      this.borderVal = '1px solid rgb(209, 209, 209)';

      let linkObservables: Observable<any>[] = [];
      for (var i = 0; i < (this.accounts).length; i++) {
        if (!this.accounts[i].itemValid) {
          console.log("Need to update item")
          linkObservables.push(this.accountService.getItemPublicToken(this.accounts[i]._id, i))
        }
        else {
          linkObservables.push(of(null))
        }
      }
      forkJoin(linkObservables).pipe(mergeMap(resArray => {
        console.log(resArray)
        for (let res of resArray) {
          console.log(res)
          if (res != null) {
            this.i = res.index
            console.log(this.i)
            var publicToken = res.public_token;
            console.log("Public Token: ", publicToken)
            var updateConfig: PlaidConfig = {
              apiVersion: "v2",
              clientName:"PayPulse",
              env: "sandbox",
              token: publicToken,
              webhook: "https://507ec71083932519eb6c52a27bbe8afd.m.pipedream.net",
              product: ["auth", "transactions"],
              countryCodes: ['US', 'CA', 'GB'],
              key: "ea1ee62219264cf290c12041f96bba",
              onSuccess: this.onUpdateSuccess,
              onExit: this.onUpdateExit
            };
            console.log(updateConfig)
            this.plaidLinkService
            .createPlaid(
              Object.assign({}, updateConfig, {
                onSuccess: (token, metadata) => this.onUpdateSuccess(token, metadata),
                onExit: (error, metadata) => this.onUpdateExit(error, metadata),
                onEvent: (eventName, metadata) => this.onUpdateEvent(eventName, metadata)
              })
            )
            .then((handler: PlaidLinkHandler) => {
              console.log(res.index)
              this.updatePlaidLinkHandlers[res.index] = handler;
              console.log(this.updatePlaidLinkHandlers)
              // this.open();
            });
          }
        }
        this.userAccountsIds = this.userAccountsDetails.ids
        console.log("Current Account Ids: ", this.currentAccountIds); 
        console.log("All Accounts: ", this.accounts);
        var today = new Date();
        // this.days = today.getDate() - 1;

        // Now get the currentAccount transactions
        let accountObservables: Observable<any>[] = [];
        for (let currAccount of this.currentAccounts) {
          accountObservables.push(this.accountService.getRecentTransactions(currAccount._id, this.days, this.subdays))
        }
        return forkJoin(accountObservables)
      }))
        .subscribe((transactionsArray) => {
          console.log(transactionsArray)
          // this.isLoading = false;
          // this.firstLoad = false;
          console.log("Inside Transactions")
          for (let transactions of transactionsArray) {
            if (transactions != null) {
              for (let transaction of transactions) {
                this.recentTransactions.push(transaction)
              }
            }
          } 
          // this.recentTransactions.forEach(element => {
          //   console.log(element);
          // });
          this.parsedTransactions = [];
          for (let entry of this.recentTransactions) {
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
              accountName: currAccountName,
              mainAccountName: currMainAccountName
            };
            this.parsedTransactions.push(newTransaction);
          }
          // this.parsedTransactions.forEach(element => {
          //   console.log(element);
          // });
          // this.selectionList.selectionChange.subscribe((s: MatSelectionListChange) => {     
          //   console.log("yup")
          //   this.selectionList.deselectAll();
          //   console.log(s);
          //   s.option.selected = true;
          // });
          this.getTopBudgets();
        });
    }
    else {
      // May need something here later
      console.log("no current accounts")
      this.marginVal = '0';
      this.borderVal = '';
      // this.fetchLinkToken();
      this.isLoading = false;

      // this.firstLoad = false;
      // this.selectionList.selectionChange.subscribe((s: MatSelectionListChange) => {     
      //   console.log("yup")
      //   this.selectionList.deselectAll();
      //   console.log(s);
      //   s.option.selected = true;
      // });
    }


  }

  getTopBudgets() {
    console.log(this.categories)
    this.accountService.getTransactionCategories()
    .pipe(
      mergeMap((categories) => {
        console.log(categories);
        this.categories = {};
        for (let row of categories) {
          var i = 0;
          var currStr = "";
          var curr = this.categories;
          while (i < row.hierarchy.length) {
            currStr = row.hierarchy[i];
            if (currStr in curr) {
              curr = curr[currStr];
            }
            else {
              curr[currStr] = {};
              curr = curr[currStr];
            }
            i += 1;
          }
        }
        console.log(this.categories);
        return this.budgetService.getBudgets()
      }),
      mergeMap(budgets => {
        console.log("made it");
        this.budgets = budgets;
        // var today = new Date();

        // this.days = today.getDate()-1;
        // this.subdays = 0;

        // console.log("Days: ", this.days);
        let transactionObservables: Observable<any>[] = [];
        for (let currAccount of this.currentAccounts) {
          transactionObservables.push(this.accountService.getBudgetTransactions(currAccount._id, this.days, this.subdays))
        }
        return forkJoin(transactionObservables)
      })
    )
    .subscribe(transactionsArray => {
      for (let transactions of transactionsArray) {
        if (transactions != null) {
          for (let transaction of transactions) {
            this.transactions.push(transaction);
          }
        }
      }
      this.onGetTransactions();
      this.getTop3Budgets();
      this.getRandomCompletedGoals();
      this.isLoading = false;
    });
    // else {
    //   this.accountService.getBudgetTransactions(this.currentAccountId, this.days, this.subdays)
    //     .subscribe(transactions => {
    //       this.transactions = transactions;
    //       this.onGetTransactions();
    //       this.getTop3Budgets();
    //       // this.handleGoals();
    //       this.isLoading = false;
    //     });
    // }
  }

  onGetTransactions() {
    console.log(this.transactions);
    for (let budget of this.budgets) {
      var mainCategory = budget.mainCategory;
      var total = 0;
      for (let transaction of this.transactions) {
        for (let category of transaction.category) {
          if (category === mainCategory) {
            total += transaction.amount;
            break;
          }
        }
      }
      budget.total = total;
    } 
  }

  truncateVal(val) {
    console.log(val)
    var strVal = String(val);
    var i = 0;
    while (i < strVal.length) {
      if (strVal[i] == ".") {
        if (i+3 <= strVal.length) {
          i = i + 3;
        }
        else if (i+2 <= strVal.length) {
          i = i + 2;
        }
        break;  
      }
      i = i + 1
    }
    console.log(i)
    return Number(strVal.substring(0, i));
  }

  getTop3Budgets() {
    var sortedBudgets = [];
    console.log(this.budgets)
    for (let budget of this.budgets) {
      // if (budget.total < Number(budget.amount) && budget.total > 0) {
      //   sortedBudgets.push(budget);
      // }
      sortedBudgets.push(budget);
    }
    sortedBudgets.sort((a, b) => {
      var diffA = Number(a.amount) - a.total;
      var diffB = Number(b.amount) - b.total;
      if(diffA > diffB) return 1;
      if(diffA <= diffB) return -1;
    });
    var i = 0;
    this.top3Budgets = [];
    while (i < 3 && sortedBudgets[i]) {
      var truncatedTotal = this.truncateVal(sortedBudgets[i].total)
      sortedBudgets[i].total = truncatedTotal;
      this.top3Budgets.push(sortedBudgets[i]);
      i += 1;
    }
    console.log("Top 3 Budgets: ", this.top3Budgets)
  }

  compare(a,b) {
    if (a.dateLastAchieved >= b.dateLastAchieved) //push more recent dates to front
       return -1;
    if (a.dateLastAchieved < b.dateLastAchieved) //if equal then use one that is further down user goals list
      return 1;
  }

  getRandomCompletedGoals() {
    var today = new Date()
    var priorDate = new Date(new Date().setDate(today.getDate()-30))
    console.log(priorDate)
    for (let usergoal of this.allUserGoals) {
      if (usergoal.goalProgress === 100 && new Date(usergoal.dateLastAchieved) >= priorDate) {
        this.recentlyCompletedUserGoals.push(usergoal)
      }
    }
    this.recentlyCompletedUserGoals.sort(this.compare);
    if (this.recentlyCompletedUserGoals.length > 3) {
      this.recentlyCompletedUserGoals = this.recentlyCompletedUserGoals.slice(2)
    }
    console.log(this.recentlyCompletedUserGoals)
    for (let usergoal of this.recentlyCompletedUserGoals) {
      for (let goal of this.allGoals) {
        if (goal._id == usergoal.goalId) {
          this.recentlyCompletedGoals.push(goal)
          break
        }
      }
    }
  }

  onAccountChanged(event, listItem) {
    var accountName = listItem[0]
    var valid = listItem[1]
    if (!this.removeAccounts && valid) {
      console.log(accountName);
      this.currentAccountName = accountName;
      this.isLoading = true;
      var nextId;
      for (let account of this.userAccountsDetails.accounts) {
        console.log(account)
        if (account.institutionName === accountName) {
          nextId = account._id;
          break;
        } 
      }
      console.log("Next Id: ", nextId);
      // Need to change current attributes on backend 
      var update = {current: false};
      this.accountService.updateCurrentAccount(this.currentAccountId, update)
        .pipe(
          mergeMap((account) => {
            var update = {current: true};
            return this.accountService.updateCurrentAccount(nextId, update)
          })
        )
        .subscribe(account => {
          this.currentAccount = account;
          console.log(this.accounts);
          // Make old current account = false
          for (let account of this.accounts) {
            if (account.current === true) {
              account.current = false;
              console.log(account)
              break;
            } 
          }
          // Make new current account = true
          for (let account of this.accounts) {
            if (account.institutionName === this.currentAccount.institutionName) {
              account.current = true;
              console.log(account)
              break;
            } 
          }
          console.log("Updated accounts: ", this.accounts)
          this.authService.storeUserAccountsDetails({currentAccount: [this.currentAccount], accounts: this.accounts, ids: this.userAccountsIds});
          this.userAccountsDetails = JSON.parse(localStorage.getItem('User Accounts Details')); // needs to be setItem instead
          console.log(this.userAccountsDetails)
          this.currentAccountId = this.userAccountsDetails.currentAccount[0]._id; // will have to change later to get selectedAccount
          this.currentAccountName = this.userAccountsDetails.currentAccount[0].institutionName;
          console.log(this.currentAccountId); 
          console.log(this.currentAccountName);

          // Now get the currentAccount transactions
          this.accountService.getRecentTransactions(this.currentAccountId, this.days, this.subdays)
            .subscribe(transactions => {
              // this.isLoading = false;
              this.recentTransactions = transactions // ^still need for one above, and change service return type not actually a transaction object -> need to filter backend
              this.recentTransactions.forEach(element => {
                console.log(element);
              });
              var currAccountName;
              this.parsedTransactions = [];
              console.log("AHH: ", this.currentAccount)
              for (let entry of this.recentTransactions) {
                // Translate account_id to account name
                console.log(entry.account_id)
                for (let account of this.userAccountsDetails.currentAccount) { // this part needs to be different
                  console.log(account)
                  for (let subAcc of account.subAccounts) {
                    if (subAcc.account_id === entry.account_id) {
                      console.log("FOUND A MATCH")
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
                  accountName: currAccountName
                };
                this.parsedTransactions.push(newTransaction);
              }
              console.log("Parsed transactions: "+ this.parsedTransactions);
              this.getTopBudgets();
            });

          // this.preSelection = [];// need to delete and then add
          // this.preSelection.push(this.currentAccountName)  
          console.log(this.listValue);
          console.log(this.preSelection);
        });
    }
  }

  onAddedAccount() {
    this.userAccountsDetails = JSON.parse(localStorage.getItem('User Accounts Details'));
    console.log(this.userAccountsDetails)

    if (this.listValue.length === 0) {
      this.isLoading = true;
      this.fullLoad = false;
      this.marginVal = '10';
      this.borderVal = '1px solid rgb(209, 209, 209)';

      for (let account of this.userAccountsDetails.accounts) {
        var valid = true;
        if (account.current && !this.userAccountsDetails.currentAccount[0].itemValid){
          valid = false;
        }
        this.listValue.push([account.institutionName, valid]);
      }
  
      console.log("List Value: ", this.listValue);

      this.currentAccountId = this.userAccountsDetails.currentAccount[0]._id; // will have to change later to get selectedAccount
      this.currentAccountName = this.userAccountsDetails.currentAccount[0].institutionName;
      this.currentAccount = this.userAccountsDetails.currentAccount[0];
      this.accounts = this.userAccountsDetails.accounts;
      this.userAccountsIds = this.userAccountsDetails.ids
      console.log("Current Account Id: ", this.currentAccountId); 
      console.log("All Accounts: ", this.accounts);

      // Now get the currentAccount transactions
      this.accountService.getRecentTransactions(this.currentAccountId, this.days, this.subdays)
        .subscribe(transactions => {
          // this.isLoading = false;
          // this.firstLoad = false;
          this.recentTransactions = transactions // ^still need for one above, and change service return type not actually a transaction object -> need to filter backend
          this.recentTransactions.forEach(element => {
            console.log(element);
          });
          var currAccountName;
          this.parsedTransactions = [];
          for (let entry of this.recentTransactions) {
            // Translate account_id to account name
            for (let account of this.userAccountsDetails.currentAccount) {
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
              accountName: currAccountName
            };
            this.parsedTransactions.push(newTransaction);
            this.getTopBudgets();
          }
          console.log("Parsed transactions: "+ this.parsedTransactions);
        });

      // this.listValue = ["SOMETHING3", "SOMETHING4"];
      
      this.preSelection.push(this.currentAccountName)
      console.log(this.preSelection);
      // this.clientForm = this.fb.group({
      //   myOtherControl: new FormControl(this.preSelection),
      // });
    }
    else {
      var valid = true;
      if (this.userAccountsDetails.accounts[this.userAccountsDetails.accounts.length - 1].current && !this.userAccountsDetails.currentAccount[0].itemValid){
        valid = false;
      }
      this.listValue.push(this.userAccountsDetails.accounts[this.userAccountsDetails.accounts.length - 1].institutionName, valid);
      this.firstLoad = false;
    }
  }

  onRemoveAccountClicked() {
    var element = document.getElementById("removeAccountButton");
    this.removeAccounts = !this.removeAccounts;
    if (this.removeAccounts) {
      element.innerText = "Cancel"
    }
    else {
      element.innerText = "Remove Accounts"
    }
  }

  onDeleteIconClicked(accountName) {
    console.log(accountName);
    const deleteAccountRef = this.dialog.open(DeleteAccountComponent, {data: {accountName: accountName[0], userAccountsDetails: this.userAccountsDetails}});
    deleteAccountRef.componentInstance.onDelete
      .subscribe(result => {
        console.log(result);
        // Delete account from listValue array 
        var index = this.listValue.indexOf([result.institutionName, true], 0);
        if (index == -1) {
          index = this.listValue.indexOf([result.institutionName, false], 0);
        }
        if (index > -1) {
          this.listValue.splice(index, 1);
        }
        // Close dialogue ref
        deleteAccountRef.close();

        // Update current account as needed (updates localStorage in the process)
        if (this.listValue.length > 0 && result.current) {
          // this.onAccountChanged(this.listValue[0]) // current becomes one at the top
          this.isLoading = true;
          var accountIndex = 0;
          for (let account of this.accounts) {
            if (account.institutionName === result.institutionName) {
              break;
            } 
            accountIndex++;
          } 
          // Delete old current from account local array
          if (accountIndex > -1) {
            this.accounts.splice(accountIndex, 1);
          }
          // Delete account from userAccountsIds array 
          const accountIdIndex = this.userAccountsIds.indexOf(result._id, 0);
          if (accountIdIndex > -1) {
            this.userAccountsIds.splice(accountIdIndex, 1);
          }
          // Get new account id
          var newAccountID = this.userAccountsIds[0];

          this.accountService.updateCurrentAccount(newAccountID, {current: true})
            .subscribe(account => {
            this.currentAccount = account;
            console.log(this.accounts);
            // Make new current account = true
            for (let account of this.accounts) {
              if (account.institutionName === this.currentAccount.institutionName) {
                account.current = true;
                console.log(account)
                break;
              } 
            }
            console.log("Updated accounts: ", this.accounts)
            this.authService.storeUserAccountsDetails({currentAccount: [this.currentAccount], accounts: this.accounts, ids: this.userAccountsIds});
            this.userAccountsDetails = JSON.parse(localStorage.getItem('User Accounts Details')); // needs to be setItem instead
            console.log(this.userAccountsDetails)
            this.currentAccountId = this.userAccountsDetails.currentAccount[0]._id; // will have to change later to get selectedAccount
            this.currentAccountName = this.userAccountsDetails.currentAccount[0].institutionName;
            console.log(this.currentAccountId); 
            this.preSelection = [];// need to delete and then add
            this.preSelection.push(this.currentAccountName)  

            // Now get the currentAccount transactions
            this.accountService.getRecentTransactions(this.currentAccountId, this.days, this.subdays)
              .subscribe(transactions => {
                // this.isLoading = false;
                this.recentTransactions = transactions // ^still need for one above, and change service return type not actually a transaction object -> need to filter backend
                this.recentTransactions.forEach(element => {
                  console.log(element);
                });
                var currAccountName;
                this.parsedTransactions = [];
                for (let entry of this.recentTransactions) {
                  // Translate account_id to account name
                  for (let account of this.userAccountsDetails.currentAccount) {
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
                    accountName: currAccountName
                  };
                  this.parsedTransactions.push(newTransaction);
                  this.getTopBudgets();
                }
                console.log("Parsed transactions: "+ this.parsedTransactions);
              });
            });
        }
        else if (this.listValue.length > 0) {
          // Delete account from accounts array
          var accountIndex = 0;
          for (let account of this.accounts) {
            if (account.institutionName === result.institutionName) {
              break;
            } 
            accountIndex++;
          } 
          // const accountIndex = this.accounts.indexOf(result, 0);
          if (accountIndex > -1) {
            this.accounts.splice(accountIndex, 1);
          } 

          // Delete account from userAccountsIds array 
          const accountIdIndex = this.userAccountsIds.indexOf(result._id, 0);
          if (accountIdIndex > -1) {
            this.userAccountsIds.splice(accountIdIndex, 1);
          }
          console.log(this.accounts)
          console.log(this.userAccountsIds)
          this.authService.storeUserAccountsDetails({currentAccount: [this.currentAccount], accounts: this.accounts, ids: this.userAccountsIds});
          this.userAccountsDetails = JSON.parse(localStorage.getItem('User Accounts Details'));
          console.log(this.userAccountsDetails)
        }
        else if (this.listValue.length === 0) { 
          localStorage.setItem('User Accounts Details', JSON.stringify({currentAccount: [], accounts: [], ids: []}));
          this.userAccountsDetails = JSON.parse(localStorage.getItem('User Accounts Details'));
          // this.onRemoveAccountClicked();
          this.removeAccounts = !this.removeAccounts;
          this.marginVal = '0';
          this.borderVal = '';
        }
    });
  }


  // PLAID FUNCTIONS
  onPlaidSuccess(event) {
    // Send the public token to your server so you can do the token exchange.
    console.log("Plaid success event: " + JSON.stringify(event));
    if (this.listValue.length > 0) {
      this.firstLoad = true;
    }
    else {
      this.fullLoad = true;
    }
    this.accountService.addAccount(event).subscribe(res => {
      if (res) {
        console.log("Successfully added account!")
        if (this.listValue.length === 0) {
          this.accountService.getAccounts().subscribe(getRes => {
            if (getRes.success) {
              // this.router.navigate(['/home']);
              // this._ngZone.run(() => this.router.navigate(['/home']));
              // Need to check the accounts array on the user object. Can store in localStorage once got
              var accountIds = [];
              for (let account of getRes.accountsData) {
                console.log(account);
                accountIds.push(account._id);
              }
              console.log(accountIds)
              this.accountService.getCurrentAccount().subscribe(currAccount => {
                this.authService.storeUserAccountsDetails({currentAccount: currAccount, accounts: getRes.accountsData, ids: accountIds});
                // this.router.navigate(['/home']);
                this.onAddedAccount();
                });
            }
            else {
              console.log(res)
              console.log("Get Accounts method from account service was not a success")
            }
          });
        }
        else { 
          // Append new account to accounts array
          this.accounts.push(res)
          // Append new account to userAccountsIds array 
          this.userAccountsIds.push(res._id)
          // Update local storage
          this.authService.storeUserAccountsDetails({currentAccount: [this.currentAccount], accounts: this.accounts, ids: this.userAccountsIds});
          this.onAddedAccount();
        }
      }
      else {
        console.log(res)
        console.log("addAccount() method from account service was not a success")
        this.firstLoad = false;
        this.fullLoad = false;
      }
    });
  }

  onPlaidExit(event) {
    // Get errors or exit reason.
    console.log("Plaid exit event: " + event);
  }

  onPlaidEvent(event) {
    // Log events so you can have insight into how your users are using plaid link.
    console.log("Plaid event: " + event);
  }

  onPlaidLoad(event) {
    // Do something when the iframe loads.
    console.log("Plaid load event: " + event);
  }

  onPlaidClick(event) {
    // Do something when the button is clicked.
    console.log("Plaid click event: " + event);
  }

  // fetchPublicToken() {
  //   console.log("fetching public token")
  //   this.accountService.getItemPublicToken().subscribe(res => {
  //     var publicToken = res.public_token;
  //     console.log(publicToken)
  //     // return publicToken
  //   })
  // }

  // fetchLinkToken() {
  //   console.log("fetching link token")
  //   var userId = JSON.parse(localStorage.getItem('JWT'))["userId"]
  //   console.log(userId)
  //   var data = {userId: userId}
  //   this.accountService.getItemLinkToken(data).subscribe(res => {
  //     var linkToken = res.link_token;
  //     console.log("Link Token: ", linkToken)
  //     this.linkToken = linkToken;
  //     return this.linkToken;
  //   })
  // }

  // Create and open programatically once the library is loaded.
  ngAfterViewInit() {
    // console.log("SFHWEAFAFJAF", this.currentAccount)
    // if (!this.currentAccount.itemValid) {
    //   this.updateItem = true;
    //   console.log("Need to update item")
    //   this.accountService.getItemPublicToken(this.currentAccountId).subscribe(res => {
    //     var publicToken = res.public_token;
    //     console.log("Public Token: ", publicToken)
    //     this.publicToken = publicToken;
    //     this.updateConfig.token = this.publicToken;
    //     console.log(this.updateConfig)
    //     this.plaidLinkService
    //     .createPlaid(
    //       Object.assign({}, this.updateConfig, {
    //         onSuccess: (token, metadata) => this.onUpdateSuccess(token, metadata),
    //         onExit: (error, metadata) => this.onUpdateExit(error, metadata),
    //         onEvent: (eventName, metadata) => this.onUpdateEvent(eventName, metadata)
    //       })
    //     )
    //     .then((handler: PlaidLinkHandler) => {
    //       this.updatePlaidLinkHandler = handler;
    //       this.updateOpen();
    //     });
    //   })
    // }

    // this.plaidLinkService
    //   .createPlaid(
    //     Object.assign({}, this.config, {
    //       onSuccess: (token, metadata) => this.onSuccess(token, metadata),
    //       onExit: (error, metadata) => this.onExit(error, metadata),
    //       onEvent: (eventName, metadata) => this.onEvent(eventName, metadata)
    //     })
    //   )
    //   .then((handler: PlaidLinkHandler) => {
    //     this.plaidLinkHandler = handler;
    //     // this.open();
    //   });
  }

  open() {
    this.plaidLinkHandler.open();
  }

  exit() {
    console.log("a")
    this.plaidLinkHandler.exit();
  }

  updateOpen(index) {
    console.log(this.updatePlaidLinkHandlers)
    this.updatePlaidLinkHandlers[index].open();
  }

  // updateExit() {
  //   console.log("b")
  //   this.updatePlaidLinkHandler.exit();
  // }

  onSuccess(token, metadata) {
    console.log("We got a token:", token);
    console.log("We got metadata:", metadata);
    // Send the public token to your server so you can do the token exchange.
    var event = {token: token, metadata: metadata}
    console.log("Plaid success event: " + JSON.stringify(event));
    if (this.listValue.length > 0) {
      this.firstLoad = true;
    }
    else {
      this.fullLoad = true;
    }
    this.accountService.addAccount(event).subscribe(res => {
      if (res) {
        console.log("Successfully added account!")
        if (this.listValue.length === 0) {
          this.accountService.getAccounts().subscribe(getRes => {
            if (getRes.success) {
              // this.router.navigate(['/home']);
              // this._ngZone.run(() => this.router.navigate(['/home']));
              // Need to check the accounts array on the user object. Can store in localStorage once got
              var accountIds = [];
              for (let account of getRes.accountsData) {
                console.log(account);
                accountIds.push(account._id);
              }
              console.log(accountIds)
              this.accountService.getCurrentAccount().subscribe(currAccount => {
                this.authService.storeUserAccountsDetails({currentAccount: currAccount, accounts: getRes.accountsData, ids: accountIds});
                // this.router.navigate(['/home']);
                this.onAddedAccount();
                });
            }
            else {
              console.log(res)
              console.log("Get Accounts method from account service was not a success")
            }
          });
        }
        else { 
          // Append new account to accounts array
          this.accounts.push(res)
          // Append new account to userAccountsIds array 
          this.userAccountsIds.push(res._id)
          // Update local storage
          this.authService.storeUserAccountsDetails({currentAccount: [this.currentAccount], accounts: this.accounts, ids: this.userAccountsIds});
          this.onAddedAccount();
        }
      }
      else {
        console.log(res)
        console.log("addAccount() method from account service was not a success")
        this.firstLoad = false;
        this.fullLoad = false;
      }
    });
  }

  onEvent(eventName, metadata) {
    console.log("We got an event:", eventName);
    console.log("We got metadata:", metadata);
  }

  onExit(error, metadata) {
    console.log("We exited:", error);
    console.log("We got metadata:", metadata);
  }

  onUpdateSuccess(token, metadata) {
    console.log("We got a token:", token);
    console.log("We got metadata:", metadata);
  }

  onUpdateEvent(eventName, metadata) {
    console.log("We got an event:", eventName);
    console.log("We got metadata:", metadata);
  }

  onUpdateExit(error, metadata) {
    console.log("We exited:", error);
    console.log("We got metadata:", metadata);
  }

  // async fetchLinkToken() {
  //   // this.config: PlaidConfig = {
  //   //   apiVersion: "v2",
  //   //   env: "sandbox",
  //   //   token: await this.fetchLinkToken(),
  //   //   webhook: "",
  //   //   product: ["auth", "transactions"],
  //   //   countryCodes: ['US', 'CA', 'GB'],
  //   //   key: "ea1ee62219264cf290c12041f96bba"
  //   // };

  //   console.log("fetching link token")
  //   var userId = JSON.parse(localStorage.getItem('JWT'))["userId"]
  //   console.log(userId)
  //   var data = {userId: userId}
  //   const response = await fetch(baseURL + 'plaid/accounts/create_link_token', { method: 'POST', body: JSON.stringify(data) });
  //   const responseJSON = await response.json();
  //   console.log(responseJSON.link_token)
  //   return responseJSON.link_token;
  // };
}

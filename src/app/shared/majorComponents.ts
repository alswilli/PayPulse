import { MajorComponent } from './majorComponent';
import { Card } from './card';

export const MAJORS: MajorComponent[] = [
    {
        id: '0',
        name: 'Transactions',
        description: "Here is a summary of your recent transactions from the last 30 days",
        cards: [
            {
                id: '0',
                name: 'Recent Transactions',
                data: ['GET MOST RECENT 3 TRANSACTIONS', "TEST"],
            }
        ]
    },
    {
        id: '1',
        name: 'Budgets',
        description: "Here is a summary of your top budgets from the last 30 days",
        cards: [
            {
                id: '0',
                name: 'Top Budgets',
                data: ['GET CURRENT BUDGET AMOUNT AND TOTAL BUDGET AMOUNT'],
            },
            // {
            //     id: '1',
            //     name: 'Budget versus last month',
            //     data: 'GET BUDGET TOTALS FOR EVERY DAY LAST/THIS MONTH',
            // },
        ]
    },
    {
        id: '2',
        name: 'Goals',
        description: "Here is a summary of your recently completed goals from the last 30 days",
        cards: [
            {
                id: '0',
                name: 'Completed Goals',
                data: ['GET MOST RECENT 3 ADDED GOALS'],
            },
            // {
            //     id: '1',
            //     name: 'Recently completed goals',
            //     data: 'GET MOST RECENT 3 COMPLETED GOALS',
            // },
        ]
    },
    // {
    //     id: '3',
    //     name: 'Sharing',
    //     description: "Here is a snapshot of your sharing feed",
    //     cards: [
    //         {
    //             id: '0',
    //             name: 'Recent posts overall',
    //             data: 'GET MOST RECENT 3 POSTS',
    //         },
    //         {
    //             id: '1',
    //             name: 'Top post ocerall',
    //             data: 'GET TOP 1 POST',
    //         },
    //     ]
    // },
    // {
    //     id: '4',
    //     name: 'Advice',
    //     description: "Here are some budgeting articles and tools you access recently",
    //     cards: [
    //         {
    //             id: '0',
    //             name: 'Recently read document (jump back in?)',
    //             data: 'GET MOST RECENT DOCUMENT READ',
    //         },
    //         {
    //             id: '1',
    //             name: 'Top widget',
    //             data: 'GET MOST USED WIDGET LINK (or in place)',
    //         },
    //     ]
    // },
];
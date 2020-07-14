const express = require("express");
const plaid = require("plaid");
const plaidRouter = express.Router();
const passport = require("passport");
const mongoose = require("mongoose");

// Load Account and User models
const Account = require("../models/accounts");
const User = require("../models/users");

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_PUBLIC_KEY = process.env.PLAID_PUBLIC_KEY;

var ACCESS_TOKEN = null;
var PUBLIC_TOKEN = null;
var ITEM_ID = null;

const client = new plaid.Client(
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_PUBLIC_KEY,
  plaid.environments.sandbox,
  { version: "2018-05-22" }
);


module.exports = plaidRouter;
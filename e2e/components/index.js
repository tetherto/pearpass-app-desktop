'use strict'

const { CreateOrEditPage } = require('./CreateOrEditPage')
const { DetailsPage } = require('./DetailsPage')
const { LoginPage } = require('./LoginPage')
const { MainPage } = require('./MainPage')
const { SideMenuPage } = require('./SideMenuPage')
const { Utilities } = require('./Utilities')
const { VaultSelectPage } = require('./VaultSelectPage')

module.exports = {
  LoginPage,
  VaultSelectPage,
  CreateOrEditPage,
  DetailsPage,
  MainPage,
  SideMenuPage,
  Utilities
}

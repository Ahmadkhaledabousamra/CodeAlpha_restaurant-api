const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const menuController = require("../controllers/menuController");
const tableController = require("../controllers/tableController");
const orderController = require("../controllers/orderController");

const { auth, isAdmin } = require("../middleware/auth");

router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);

router.get("/menu", menuController.getMenu);
router.post("/menu", auth, isAdmin, menuController.addMenu);
router.post("/menu/categories", auth, isAdmin, menuController.addCategory);

router.get("/tables", auth, tableController.getTables);
router.post("/tables", auth, isAdmin, tableController.addTable);

router.post("/orders", auth, orderController.placeOrder);

module.exports = router;
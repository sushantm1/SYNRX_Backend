const express = require("express");
const {
  registerAdminUser,
  listPendingFaculty,
  approvedFaculty,
  rejectFaculty,
  createFaculty,
  getFaculty,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
} = require("../controllers/adminCtrl");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post(
  "/create-user",
  protect,
  authorizeRoles("superadmin"),
  registerAdminUser
);

// Faculty Management
router.post(
  "/create-faculty",
  protect,
  authorizeRoles("superadmin"),
  createFaculty
);

router.get(
  "/faculties",
  protect,
  authorizeRoles("superadmin"),
  getFaculty
);

router.get(
  "/faculty/:id",
  protect,
  authorizeRoles("superadmin"),
  getFacultyById
);

router.put(
  "/faculty/:id",
  protect,
  authorizeRoles("superadmin"),
  updateFaculty
);

router.delete(
  "/faculty/:id",
  protect,
  authorizeRoles("superadmin"),
  deleteFaculty
);

router.get(
  "/pending-faculty",
  protect,
  authorizeRoles("superadmin"),
  listPendingFaculty
);
router.patch(
  "/approve-faculty/:id",
  protect,
  authorizeRoles("superadmin"),
  approvedFaculty
);

router.patch(
  "/reject-faculty/:id",
  protect,
  authorizeRoles("superadmin"),
  rejectFaculty
);

module.exports = router;

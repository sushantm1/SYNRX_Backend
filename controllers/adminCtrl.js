// controllers/adminController.js
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

const registerAdminUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, confirmPassword, roles } = req.body;

  // Only one superadmin allowed
  if (roles === "superadmin") {
    const existing = await User.findOne({ roles: "superadmin" });
    if (existing) {
      return res.status(403).json({ error: "A superadmin already exists" });
    }
  }

  if (!["faculty", "superadmin"].includes(roles)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  if (password !== confirmPassword)
    return res.status(400).json({ error: "Passwords do not match" });

  const userExists = await User.findOne({ email });
  if (userExists)
    return res.status(400).json({ error: "Email already registered" });

  const user = await User.create({
    fullName,
    email,
    password,
    roles,
    isVerified: true,
  });

  res
    .status(201)
    .json({ message: `${roles} created successfully`, userId: user._id });
});

const listPendingFaculty = asyncHandler(async (req, res) => {
  const pending = await User.find({
    roles: "faculty",
    isApproved: false,
  }).select("-password");

  res.status(200).json({ pending });
});

const approvedFaculty = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const faculty = await User.findById(id);
  if (!faculty) {
    return res.status(404).json({ error: "Faculty not found" });
  }
  if (faculty.roles !== "faculty") {
    return res.status(400).json({ error: "User is not a faculty" });
  }

  faculty.isApproved = true;
  faculty.approvalStatus = "approved";
  faculty.approvedBy = req.user._id;
  faculty.approvedAt = new Date();
  faculty.rejectionReason = undefined;
  await faculty.save();

  res.status(200).json({ message: "Faculty approved", userId: faculty._id });
});

const rejectFaculty = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { reason } = req.body;

  const faculty = await User.findById(id);

  if (!faculty) {
    return res.status(404).json({ error: "Faculty not found" });
  }

  if (faculty.roles !== "faculty") {
    return res.status(400).json({ error: "User is not a faculty" });
  }

  faculty.isApproved = false;
  faculty.approvalStatus = "rejected"; // IMPORTANT
  faculty.rejectionReason = reason || "No reason provided";
  faculty.approvedBy = req.user._id;
  faculty.approvedAt = new Date();

  await faculty.save();

  res.status(200).json({
    message: "Faculty request rejected",
    userId: faculty._id,
    status: faculty.approvalStatus,
    reason: faculty.rejectionReason,
  });
});

const createFaculty = asyncHandler(async (req, res) => {
  const { fullName, email, phone, department, specialization, password, confirmPassword } = req.body;

  // Validate inputs
  if (!fullName || !email || !phone || !department || !specialization || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  // Check if email already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ error: "Email already registered" });
  }

  // Generate unique facultyId
  const facultyId = `F${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Create faculty user
  const faculty = await User.create({
    fullName,
    email,
    phone,
    department,
    specialization,
    password,
    roles: "faculty",
    isVerified: true,
    isApproved: true, // Auto-approve since created by superadmin
    approvalStatus: "approved",
    approvedBy: req.user._id,
    approvedAt: new Date(),
    facultyId,
  });

  res.status(201).json({
    message: "Faculty created successfully",
    facultyId: faculty._id,
    email: faculty.email,
    phone: faculty.phone,
    department: faculty.department,
    specialization: faculty.specialization,
  });
});

const getFaculty = asyncHandler(async (req, res) => {
  const faculties = await User.find({ roles: "faculty" }).select("-password");
  res.status(200).json({ faculties });
});

const getFacultyById = asyncHandler(async (req, res) => {
  const faculty = await User.findById(req.params.id);
  if (!faculty || faculty.roles !== "faculty") {
    return res.status(404).json({ error: "Faculty not found" });
  }
  res.status(200).json({ faculty });
});

const updateFaculty = asyncHandler(async (req, res) => {
  const { fullName, phone, specialization } = req.body;
  const facultyId = req.params.id;

  const faculty = await User.findById(facultyId);
  if (!faculty || faculty.roles !== "faculty") {
    return res.status(404).json({ error: "Faculty not found" });
  }

  if (fullName) faculty.fullName = fullName;
  if (phone) faculty.phone = phone;
  if (specialization) faculty.specialization = specialization;

  await faculty.save();

  res.status(200).json({
    message: "Faculty updated successfully",
    faculty,
  });
});

const deleteFaculty = asyncHandler(async (req, res) => {
  const facultyId = req.params.id;
  const faculty = await User.findById(facultyId);

  if (!faculty || faculty.roles !== "faculty") {
    return res.status(404).json({ error: "Faculty not found" });
  }

  await User.findByIdAndDelete(facultyId);

  res.status(200).json({
    message: "Faculty deleted successfully",
  });
});

module.exports = {
  registerAdminUser,
  listPendingFaculty,
  approvedFaculty,
  rejectFaculty,
  createFaculty,
  getFaculty,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
};

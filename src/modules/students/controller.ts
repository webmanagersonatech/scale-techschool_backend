import { Request, Response } from "express";
import Student from "./model";
import { AuthRequest } from "../../middlewares/auth";
import { createStudentSchema, updateStudentSchema } from "./students.sanitize";
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

// Create Student
export const createStudent = async (req: AuthRequest, res: Response) => {
  const { error, value } = createStudentSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  try {
    // Check if student with same scale ID already exists
    const existingStudent = await Student.findOne({
      studentScaleId: value.studentScaleId
    });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: `Student with Scale ID "${value.studentScaleId}" already exists. Please use a unique Scale ID.`,
        error: "DUPLICATE_SCALE_ID",
        field: "studentScaleId"
      });
    }

    // Check for duplicate email
    const existingEmail = await Student.findOne({
      email: value.email
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: `Student with email "${value.email}" already exists. Please use a different email.`,
        error: "DUPLICATE_EMAIL",
        field: "email"
      });
    }

    // Check for duplicate phone
    const existingPhone = await Student.findOne({
      phone: value.phone
    });

    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: `Student with phone number "${value.phone}" already exists. Please use a different phone number.`,
        error: "DUPLICATE_PHONE",
        field: "phone"
      });
    }

    const student = await Student.create(value);

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: student,
    });
  } catch (err: any) {
    // Handle MongoDB duplicate key error (fallback)
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const value = err.keyValue[field];

      return res.status(409).json({
        success: false,
        message: `Student with ${field} "${value}" already exists.`,
        error: "DUPLICATE_KEY",
        field: field
      });
    }

    console.error("Create student error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create student. Please try again later.",
    });
  }
};

// List Students
export const listStudents = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = (req.query.search as string) || "";
    const event = (req.query.event as string) || "";

    const query: any = {};

    // Search filter
    if (search.trim()) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { studentScaleId: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Event filter - exact match
    if (event && event.trim() && event !== "all") {
      query.events = { $regex: `^${event}$`, $options: "i" };
    }

    const students = await (Student as any).paginate(query, {
      page,
      limit,
      sort: { createdAt: -1 },
      lean: true,
    });

    return res.status(200).json({
      success: true,
      students,
    });
  } catch (err: any) {
    console.error("List students error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch students. Please try again later.",
    });
  }
};

// Get Student
export const getStudent = async (req: Request, res: Response) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: student,
    });
  } catch (err: any) {
    console.error("Get student error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student. Please try again later.",
    });
  }
};

// Update Student
export const updateStudent = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const { error, value } = updateStudentSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Check if student exists
    const existingStudent = await Student.findById(req.params.id);
    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if another student has the same scale ID (excluding current student)
    if (value.studentScaleId && value.studentScaleId !== existingStudent.studentScaleId) {
      const duplicateScaleId = await Student.findOne({
        studentScaleId: value.studentScaleId,
        _id: { $ne: req.params.id }
      });

      if (duplicateScaleId) {
        return res.status(409).json({
          success: false,
          message: `Student with Scale ID "${value.studentScaleId}" already exists. Please use a unique Scale ID.`,
          error: "DUPLICATE_SCALE_ID",
          field: "studentScaleId"
        });
      }
    }

    // Check if another student has the same email (excluding current student)
    if (value.email && value.email !== existingStudent.email) {
      const duplicateEmail = await Student.findOne({
        email: value.email,
        _id: { $ne: req.params.id }
      });

      if (duplicateEmail) {
        return res.status(409).json({
          success: false,
          message: `Student with email "${value.email}" already exists. Please use a different email.`,
          error: "DUPLICATE_EMAIL",
          field: "email"
        });
      }
    }

    // Check if another student has the same phone (excluding current student)
    if (value.phone && value.phone !== existingStudent.phone) {
      const duplicatePhone = await Student.findOne({
        phone: value.phone,
        _id: { $ne: req.params.id }
      });

      if (duplicatePhone) {
        return res.status(409).json({
          success: false,
          message: `Student with phone number "${value.phone}" already exists. Please use a different phone number.`,
          error: "DUPLICATE_PHONE",
          field: "phone"
        });
      }
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      value,
      {
        new: true,
        runValidators: true,
        context: 'query',
      }
    );

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: student,
    });
  } catch (err: any) {
    // Handle MongoDB duplicate key error (fallback)
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const value = err.keyValue[field];

      return res.status(409).json({
        success: false,
        message: `Student with ${field} "${value}" already exists.`,
        error: "DUPLICATE_KEY",
        field: field
      });
    }

    console.error("Update student error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update student. Please try again later.",
    });
  }
};

// Delete Student
export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully",
      data: student,
    });
  } catch (err: any) {
    console.error("Delete student error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete student. Please try again later.",
    });
  }
};

// ==================== QR CODE OPERATIONS ====================

// Generate QR Code for Student
export const generateQR = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.id;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if QR already exists
    if (student.qrCode) {
      return res.status(409).json({
        success: false,
        message: "QR Code already exists. Use regenerate endpoint to create a new one.",
        error: "QR_ALREADY_EXISTS",
      });
    }

    // Generate unique QR data
    const qrData = JSON.stringify({
      studentId: student._id,
      studentScaleId: student.studentScaleId,
      name: student.name,
      email: student.email,
      events: student.events,
      timestamp: new Date().toISOString(),
      token: uuidv4(),
      version: "1.0"
    });

    // Generate QR code as base64
    const qrCode = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400,
      color: {
        dark: '#0B1A2F', // Blue-900
        light: '#FFFFFF'
      }
    });

    // Save QR code to student record
    student.qrCode = qrCode;
    student.qrGeneratedAt = new Date();
    student.qrToken = uuidv4(); // Store token for validation
    await student.save();

    return res.status(200).json({
      success: true,
      message: "QR Code generated successfully",
      qrCode: qrCode,
      data: student
    });
  } catch (error: any) {
    console.error("Generate QR error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate QR code. Please try again later.",
      error: error.message
    });
  }
};

// Regenerate QR Code for Student
export const regenerateQR = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.id;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Generate new QR data with new token
    const qrData = JSON.stringify({
      studentId: student._id,
      studentScaleId: student.studentScaleId,
      name: student.name,
      email: student.email,
      events: student.events,
      timestamp: new Date().toISOString(),
      token: uuidv4(),
      version: "1.0",
      regenerated: true,
      previousRegeneration: student.qrGeneratedAt || null
    });

    // Generate QR code as base64
    const qrCode = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400,
      color: {
        dark: '#0B1A2F',
        light: '#FFFFFF'
      }
    });

    // Update student QR code
    student.qrCode = qrCode;
    student.qrGeneratedAt = new Date();
    student.qrToken = uuidv4(); // New token
    student.qrRegeneratedCount = (student.qrRegeneratedCount || 0) + 1;
    await student.save();

    return res.status(200).json({
      success: true,
      message: "QR Code regenerated successfully",
      qrCode: qrCode,
      data: student,
      regeneratedCount: student.qrRegeneratedCount
    });
  } catch (error: any) {
    console.error("Regenerate QR error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to regenerate QR code. Please try again later.",
      error: error.message
    });
  }
};

// Download QR Code for Student
export const downloadQR = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.id;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (!student.qrCode) {
      return res.status(404).json({
        success: false,
        message: "QR Code not generated yet. Please generate QR code first.",
        error: "QR_NOT_FOUND"
      });
    }

    // Convert base64 to buffer
    const base64Data = student.qrCode.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Set response headers for download
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename=qr-${student.studentScaleId}-${student.name.replace(/\s/g, '-')}.png`);
    res.setHeader('Content-Length', imageBuffer.length);

    return res.send(imageBuffer);
  } catch (error: any) {
    console.error("Download QR error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to download QR code. Please try again later.",
      error: error.message
    });
  }
};
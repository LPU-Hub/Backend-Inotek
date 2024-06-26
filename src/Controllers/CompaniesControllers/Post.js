import bcrypt from "bcrypt";
import schemas from "../../Models/index.js";
import { Jwt } from "../../Helpers/index.js";

const { CompanySchema } = schemas;

// Signup
export const signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      yearOfEstablishment,
      fieldsOfWork,
      ShortDescription,
    } = req.body;

    // Check if the user already exists
    const existingUser = await CompanySchema.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "Company already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new CompanySchema({
      _id: new mongoose.Types.ObjectId(),
      name,
      email,
      yearOfEstablishment,
      fieldsOfWork,
      ShortDescription,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    const payload = {
      _id: newUser._id,
      name: newUser.name,
    };

    const access_Token = Jwt.signAccessToken(payload);

    res.status(201).json({
      message: "User signup successfully",
      user: payload,
      access_Token,
      accountType: "company",
    });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await CompanySchema.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const payload = {
      _id: user._id,
      name: user.name,
    };
    const access_Token = Jwt.signAccessToken(payload);

    res.status(200).json({
      message: "Login successful",
      access_Token,
      user: payload,
      accountType: "company",
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Verify JWT Token
export const verifyToken = async (token) => {
  try {
    const decoded = Jwt.verifyAccessToken(token);
    return decoded;
  } catch (error) {
    console.error("Error in verifying token:", error);
    return null;
  }
};
const companiesController = {
  login,
  signup,
};

export default companiesController;

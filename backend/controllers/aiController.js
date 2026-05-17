import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import Course from "../models/courseModel.js";

dotenv.config();

export const searchWithAi = async (req, res) => {
  try {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // 🔥 STEP 1: STRICT SEARCH
    let courses = await Course.find({
      isPublished: true,
      $or: [
        { title: { $regex: input, $options: "i" } },
        { category: { $regex: input, $options: "i" } }
      ]
    });

    if (courses.length > 0) {
      return res.status(200).json(courses);
    }

    // 🔥 STEP 2: AI
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `
Return ONLY ONE keyword from:
App Development, AI/ML, AI Tools, Data Science, Data Analytics, Ethical Hacking, UI UX Designing, Web Development, Others

Query: ${input}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const keyword = response.text.trim();

    // 🔥 STEP 3: AI FILTER
    courses = await Course.find({
      isPublished: true,
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { category: { $regex: keyword, $options: "i" } }
      ]
    });

    return res.status(200).json(courses);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error" });
  }
};
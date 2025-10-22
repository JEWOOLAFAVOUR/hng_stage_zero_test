import express, { Response, Request, NextFunction } from "express";
import morgan from "morgan";
import axios from "axios";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import crypto from "crypto";

const app = express();

const PORT = 3000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: "error",
    error: "Too many requests, please try again later.",
  },
});

app.use(morgan("dev"));
app.use(limiter);
app.use(cors());
app.use(helmet());
app.use(express.json());

interface UserProfile {
  email: string;
  name: string;
  stack: string;
}

interface ApiResponse {
  status: "success";
  user: UserProfile;
  timestamp: string;
  fact: string;
}

// String Analyzer Interfaces
interface StringProperties {
  length: number;
  is_palindrome: boolean;
  unique_characters: number;
  word_count: number;
  sha256_hash: string;
  character_frequency_map: Record<string, number>;
}

interface StringData {
  id: string;
  value: string;
  properties: StringProperties;
  created_at: string;
}

interface FilterParams {
  is_palindrome?: boolean;
  min_length?: number;
  max_length?: number;
  word_count?: number;
  contains_character?: string;
}

// In-memory storage
const stringStorage: Map<string, StringData> = new Map();

app.get("/me", async (req: Request, res: Response) => {
  try {
    const fact = await axios.get("https://catfact.ninja/fact", {
      timeout: 10000,
    });
    const response: ApiResponse = {
      status: "success",
      user: {
        email: "jewoolafavour2020@gmail.com",
        name: "Jewoola Favour",
        stack: "Node.js/Express",
      },
      timestamp: new Date().toISOString(),
      fact: fact.data.fact || "No cat fact available at the moment.",
    };
    res.status(200).json(response);
  } catch (error) {
    res.status(200).json({
      status: "success",
      user: {
        email: "jewoolafavour2020@gmail.com",
        name: "Jewoola Favour",
        stack: "Node.js/Express",
      },
      timestamp: new Date().toISOString(),
      fact: "Could not fetch cat fact at the moment.",
    });
  }
});

// String Analysis Functions
function analyzeString(value: string): StringProperties {
  const sha256Hash = crypto.createHash("sha256").update(value).digest("hex");

  // Calculate character frequency map
  const characterFrequencyMap: Record<string, number> = {};
  for (const char of value) {
    characterFrequencyMap[char] = (characterFrequencyMap[char] || 0) + 1;
  }

  // Check if palindrome (case-insensitive)
  const normalizedValue = value.toLowerCase().replace(/\s/g, "");
  const isPalindrome =
    normalizedValue === normalizedValue.split("").reverse().join("");

  // Count unique characters
  const uniqueCharacters = new Set(value).size;

  // Count words (split by whitespace)
  const wordCount = value
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  return {
    length: value.length,
    is_palindrome: isPalindrome,
    unique_characters: uniqueCharacters,
    word_count: wordCount,
    sha256_hash: sha256Hash,
    character_frequency_map: characterFrequencyMap,
  };
}

// String Analyzer Routes

// POST /strings - Create/Analyze String
app.post("/strings", (req: Request, res: Response) => {
  try {
    const { value } = req.body;

    // Validation
    if (!value) {
      return res.status(400).json({
        status: "error",
        message: "Missing 'value' field in request body",
      });
    }

    if (typeof value !== "string") {
      return res.status(422).json({
        status: "error",
        message: "Invalid data type for 'value'. Must be a string.",
      });
    }

    // Check if string already exists
    const existingString = Array.from(stringStorage.values()).find(
      (item) => item.value === value
    );
    if (existingString) {
      return res.status(409).json({
        status: "error",
        message: "String already exists in the system",
      });
    }

    // Analyze string
    const properties = analyzeString(value);
    const stringData: StringData = {
      id: properties.sha256_hash,
      value: value,
      properties: properties,
      created_at: new Date().toISOString(),
    };

    // Store in memory
    stringStorage.set(properties.sha256_hash, stringData);

    res.status(201).json(stringData);
  } catch (error) {
    console.error("Error in POST /strings:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

// GET /strings/{string_value} - Get Specific String
app.get("/strings/:stringValue", (req: Request, res: Response) => {
  try {
    const { stringValue } = req.params;

    // Find string by value
    const stringData = Array.from(stringStorage.values()).find(
      (item) => item.value === stringValue
    );

    if (!stringData) {
      return res.status(404).json({
        status: "error",
        message: "String does not exist in the system",
      });
    }

    res.status(200).json(stringData);
  } catch (error) {
    console.error("Error in GET /strings/:stringValue:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

// GET /strings - Get All Strings with Filtering
app.get("/strings", (req: Request, res: Response) => {
  try {
    const {
      is_palindrome,
      min_length,
      max_length,
      word_count,
      contains_character,
    } = req.query;

    let filteredStrings = Array.from(stringStorage.values());
    const appliedFilters: any = {};

    // Apply filters
    if (is_palindrome !== undefined) {
      const isPalindromeFilter = is_palindrome === "true";
      appliedFilters.is_palindrome = isPalindromeFilter;
      filteredStrings = filteredStrings.filter(
        (item) => item.properties.is_palindrome === isPalindromeFilter
      );
    }

    if (min_length !== undefined) {
      const minLengthFilter = parseInt(min_length as string);
      if (isNaN(minLengthFilter)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid value for min_length parameter",
        });
      }
      appliedFilters.min_length = minLengthFilter;
      filteredStrings = filteredStrings.filter(
        (item) => item.properties.length >= minLengthFilter
      );
    }

    if (max_length !== undefined) {
      const maxLengthFilter = parseInt(max_length as string);
      if (isNaN(maxLengthFilter)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid value for max_length parameter",
        });
      }
      appliedFilters.max_length = maxLengthFilter;
      filteredStrings = filteredStrings.filter(
        (item) => item.properties.length <= maxLengthFilter
      );
    }

    if (word_count !== undefined) {
      const wordCountFilter = parseInt(word_count as string);
      if (isNaN(wordCountFilter)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid value for word_count parameter",
        });
      }
      appliedFilters.word_count = wordCountFilter;
      filteredStrings = filteredStrings.filter(
        (item) => item.properties.word_count === wordCountFilter
      );
    }

    if (contains_character !== undefined) {
      const containsCharFilter = contains_character as string;
      if (containsCharFilter.length !== 1) {
        return res.status(400).json({
          status: "error",
          message: "contains_character must be a single character",
        });
      }
      appliedFilters.contains_character = containsCharFilter;
      filteredStrings = filteredStrings.filter((item) =>
        item.value.includes(containsCharFilter)
      );
    }

    res.status(200).json({
      data: filteredStrings,
      count: filteredStrings.length,
      filters_applied: appliedFilters,
    });
  } catch (error) {
    console.error("Error in GET /strings:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

// GET /strings/filter-by-natural-language - Natural Language Filtering
app.get(
  "/strings/filter-by-natural-language",
  (req: Request, res: Response) => {
    try {
      const { query } = req.query;

      if (!query || typeof query !== "string") {
        return res.status(400).json({
          status: "error",
          message: "Missing or invalid 'query' parameter",
        });
      }

      const queryLower = query.toLowerCase();
      const parsedFilters: any = {};

      // Parse natural language queries
      if (
        queryLower.includes("single word") ||
        queryLower.includes("one word")
      ) {
        parsedFilters.word_count = 1;
      }

      if (queryLower.includes("palindrom")) {
        parsedFilters.is_palindrome = true;
      }

      if (queryLower.includes("longer than")) {
        const match = queryLower.match(/longer than (\d+)/);
        if (match) {
          parsedFilters.min_length = parseInt(match[1]) + 1;
        }
      }

      if (queryLower.includes("containing the letter")) {
        const match = queryLower.match(/containing the letter ([a-z])/);
        if (match) {
          parsedFilters.contains_character = match[1];
        }
      }

      if (queryLower.includes("contain") && queryLower.includes("vowel")) {
        // Default to 'a' for vowel searches
        parsedFilters.contains_character = "a";
      }

      // Apply parsed filters
      let filteredStrings = Array.from(stringStorage.values());

      if (parsedFilters.word_count !== undefined) {
        filteredStrings = filteredStrings.filter(
          (item) => item.properties.word_count === parsedFilters.word_count
        );
      }

      if (parsedFilters.is_palindrome !== undefined) {
        filteredStrings = filteredStrings.filter(
          (item) =>
            item.properties.is_palindrome === parsedFilters.is_palindrome
        );
      }

      if (parsedFilters.min_length !== undefined) {
        filteredStrings = filteredStrings.filter(
          (item) => item.properties.length >= parsedFilters.min_length
        );
      }

      if (parsedFilters.contains_character !== undefined) {
        filteredStrings = filteredStrings.filter((item) =>
          item.value.includes(parsedFilters.contains_character)
        );
      }

      res.status(200).json({
        data: filteredStrings,
        count: filteredStrings.length,
        interpreted_query: {
          original: query,
          parsed_filters: parsedFilters,
        },
      });
    } catch (error) {
      console.error("Error in GET /strings/filter-by-natural-language:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  }
);

// DELETE /strings/{string_value} - Delete String
app.delete("/strings/:stringValue", (req: Request, res: Response) => {
  try {
    const { stringValue } = req.params;

    // Find string by value
    const stringData = Array.from(stringStorage.values()).find(
      (item) => item.value === stringValue
    );

    if (!stringData) {
      return res.status(404).json({
        status: "error",
        message: "String does not exist in the system",
      });
    }

    // Remove from storage
    stringStorage.delete(stringData.id);

    res.status(204).send();
  } catch (error) {
    console.error("Error in DELETE /strings/:stringValue:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: "Something went wrong!",
  });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g;

const RECIPES = [
  { name: "Veggie Omelette", required: ["eggs", "onion"], optional: ["tomato", "spinach", "mushroom"], tags: ["breakfast", "high-protein"], timeMins: 15 },
  { name: "Chickpea Spinach Curry", required: ["chickpeas", "onion", "garlic"], optional: ["spinach", "tomato", "rice"], tags: ["vegan", "one-pot"], timeMins: 30 },
  { name: "Pasta Primavera", required: ["pasta", "olive oil", "garlic"], optional: ["broccoli", "bell pepper", "zucchini"], tags: ["vegetarian", "quick"], timeMins: 25 },
  { name: "Lentil Soup", required: ["lentils", "onion", "carrot"], optional: ["garlic", "tomato", "cabbage"], tags: ["vegan", "soup"], timeMins: 35 },
  { name: "Rice and Beans Bowl", required: ["rice", "beans"], optional: ["tomato", "onion", "bell pepper"], tags: ["vegan", "meal-prep"], timeMins: 20 },
  { name: "Vegetable Fried Rice", required: ["rice", "eggs", "onion"], optional: ["peas", "carrot", "green beans"], tags: ["quick", "one-pan"], timeMins: 20 },
  { name: "Tomato Basil Pasta", required: ["pasta", "tomato", "olive oil"], optional: ["garlic", "onion", "spinach"], tags: ["vegetarian", "quick"], timeMins: 18 },
  { name: "Stuffed Bell Peppers", required: ["bell pepper", "rice"], optional: ["beans", "tomato", "onion"], tags: ["baked", "vegetarian"], timeMins: 40 },
  { name: "Aloo Matar", required: ["potato", "peas", "onion"], optional: ["tomato", "garlic", "rice"], tags: ["vegan", "indian"], timeMins: 30 },
  { name: "Mushroom Toast", required: ["bread", "mushroom"], optional: ["garlic", "onion", "spinach"], tags: ["breakfast", "quick"], timeMins: 15 },
  { name: "Cabbage Stir Fry", required: ["cabbage", "onion", "garlic"], optional: ["carrot", "peas", "rice"], tags: ["vegan", "stir-fry"], timeMins: 18 },
  { name: "Broccoli Pasta", required: ["pasta", "broccoli", "garlic"], optional: ["olive oil", "mushroom", "peas"], tags: ["vegetarian", "quick"], timeMins: 22 },
  { name: "Carrot Lentil Stew", required: ["lentils", "carrot", "onion"], optional: ["tomato", "garlic", "spinach"], tags: ["vegan", "stew"], timeMins: 35 },
  { name: "Zucchini Noodles", required: ["zucchini", "garlic", "olive oil"], optional: ["tomato", "mushroom", "onion"], tags: ["low-carb", "quick"], timeMins: 15 },
  { name: "Bean Tacos", required: ["beans", "onion"], optional: ["tomato", "cabbage", "bell pepper"], tags: ["mexican", "quick"], timeMins: 20 },
  { name: "Spinach Rice Pilaf", required: ["rice", "spinach", "onion"], optional: ["peas", "garlic", "carrot"], tags: ["one-pot", "vegetarian"], timeMins: 25 },
  { name: "Potato Hash", required: ["potato", "onion"], optional: ["bell pepper", "eggs", "mushroom"], tags: ["breakfast", "one-pan"], timeMins: 20 },
  { name: "Shakshuka", required: ["eggs", "tomato", "onion"], optional: ["bell pepper", "garlic", "bread"], tags: ["breakfast", "one-pan"], timeMins: 25 },
  { name: "Veggie Quesadilla", required: ["bread", "bell pepper"], optional: ["onion", "tomato", "beans"], tags: ["quick", "snack"], timeMins: 12 },
  { name: "Cauliflower Rice Bowl", required: ["cauliflower", "onion"], optional: ["peas", "carrot", "garlic"], tags: ["low-carb", "quick"], timeMins: 18 },
  { name: "Tomato Lentil Pasta", required: ["lentils", "pasta", "tomato"], optional: ["garlic", "onion", "spinach"], tags: ["high-protein", "vegetarian"], timeMins: 30 },
  { name: "Green Bean Stir Fry", required: ["green beans", "garlic", "onion"], optional: ["carrot", "rice", "mushroom"], tags: ["vegan", "stir-fry"], timeMins: 20 },
  { name: "Pea Mushroom Pasta", required: ["pasta", "peas", "mushroom"], optional: ["garlic", "onion", "olive oil"], tags: ["vegetarian", "quick"], timeMins: 22 },
  { name: "Rustic Veg Soup", required: ["onion", "carrot", "tomato"], optional: ["cabbage", "potato", "beans"], tags: ["vegan", "soup"], timeMins: 32 },
  { name: "Chickpea Salad Toast", required: ["chickpeas", "bread"], optional: ["tomato", "onion", "cabbage"], tags: ["quick", "high-protein"], timeMins: 10 },
  {
    name: "Moong Dal Khichdi (Baby)",
    required: ["rice", "moong dal"],
    optional: ["carrot", "bottle gourd", "ghee"],
    tags: ["indian", "baby-friendly", "toddler-friendly", "one-pot"],
    timeMins: 25,
  },
  {
    name: "Vegetable Suji Upma (Toddler)",
    required: ["suji", "onion"],
    optional: ["carrot", "peas", "ghee"],
    tags: ["indian", "toddler-friendly", "quick"],
    timeMins: 18,
  },
  {
    name: "Ragi Porridge",
    required: ["ragi flour"],
    optional: ["ghee", "milk", "banana"],
    tags: ["indian", "baby-friendly", "breakfast"],
    timeMins: 12,
  },
  {
    name: "Poha with Veg (Toddler)",
    required: ["poha", "onion"],
    optional: ["peas", "carrot", "potato"],
    tags: ["indian", "toddler-friendly", "quick"],
    timeMins: 15,
  },
  {
    name: "Dal Rice Mash",
    required: ["rice", "lentils"],
    optional: ["ghee", "pumpkin", "carrot"],
    tags: ["indian", "baby-friendly", "comfort"],
    timeMins: 25,
  },
  {
    name: "Pumpkin Dal Soup (Baby)",
    required: ["pumpkin", "moong dal"],
    optional: ["ghee", "garlic", "carrot"],
    tags: ["indian", "baby-friendly", "soup"],
    timeMins: 22,
  },
  {
    name: "Besan Chilla (Soft)",
    required: ["besan", "onion"],
    optional: ["tomato", "spinach", "ghee"],
    tags: ["indian", "toddler-friendly", "breakfast"],
    timeMins: 15,
  },
  {
    name: "Sweet Potato Khichdi",
    required: ["rice", "moong dal", "sweet potato"],
    optional: ["ghee", "carrot", "peas"],
    tags: ["indian", "baby-friendly", "one-pot"],
    timeMins: 28,
  },
  {
    name: "Beetroot Rice Mash",
    required: ["rice", "beetroot"],
    optional: ["ghee", "carrot", "peas"],
    tags: ["indian", "baby-friendly", "toddler-friendly"],
    timeMins: 24,
  },
  {
    name: "Lauki Dal (Bottle Gourd)",
    required: ["bottle gourd", "moong dal"],
    optional: ["onion", "garlic", "ghee"],
    tags: ["indian", "baby-friendly", "toddler-friendly"],
    timeMins: 26,
  },
];

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json").send(JSON.stringify(payload));
}

function normalizeToken(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(CONTROL_CHARS, " ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeList(value, max = 80) {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set();
  for (const item of value) {
    const token = normalizeToken(item);
    if (!token) {
      continue;
    }
    seen.add(token);
    if (seen.size >= max) {
      break;
    }
  }

  return [...seen];
}

function parseBody(req) {
  if (!req.body) {
    return {};
  }
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  if (typeof req.body === "object") {
    return req.body;
  }
  return null;
}

function recipeIngredients(recipe) {
  return [...recipe.required, ...recipe.optional].map(normalizeToken);
}

function recipeSupportsRestrictions(recipe, restrictions) {
  if (!restrictions.length) {
    return true;
  }

  const ingredients = recipeIngredients(recipe);
  const tags = recipe.tags.map(normalizeToken);

  for (const restriction of restrictions) {
    if (restriction === "vegan") {
      const hasAnimalItems = ingredients.some((item) =>
        ["eggs", "yogurt", "ghee", "milk"].includes(item)
      );
      if (hasAnimalItems || !tags.includes("vegan")) {
        return false;
      }
    }

    if (restriction === "egg-free" && ingredients.includes("eggs")) {
      return false;
    }

    if (
      restriction === "dairy-free" &&
      ingredients.some((item) => ["yogurt", "ghee", "milk"].includes(item))
    ) {
      return false;
    }

    if (
      restriction === "gluten-free" &&
      ingredients.some((item) => ["bread", "pasta", "suji"].includes(item))
    ) {
      return false;
    }

    if (restriction === "vegetarian") {
      const hasNonVeg = ingredients.some((item) =>
        ["chicken", "fish", "mutton", "beef", "prawn"].includes(item)
      );
      if (hasNonVeg) {
        return false;
      }
    }
  }

  return true;
}

function scoreRecipe(recipe, available, prefs) {
  const missingRequired = recipe.required.filter((item) => !available.has(item));
  const matchedOptional = recipe.optional.filter((item) => available.has(item)).length;

  let score = (recipe.required.length - missingRequired.length) * 4 + matchedOptional * 2 - recipe.timeMins / 20;

  if (Array.isArray(prefs?.preferredTags)) {
    const matchedTags = prefs.preferredTags
      .map(normalizeToken)
      .filter((tag) => recipe.tags.includes(tag)).length;
    score += matchedTags * 2;
  }

  return {
    name: recipe.name,
    tags: recipe.tags,
    timeMins: recipe.timeMins,
    missingRequired,
    score,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const body = parseBody(req);
    if (!body || typeof body !== "object") {
      return json(res, 400, { error: "Invalid JSON payload" });
    }

    const pantry = normalizeList(body.pantry);
    const vegetables = normalizeList(body.vegetables);
    const prefs = body.prefs && typeof body.prefs === "object" ? body.prefs : {};
    const dietaryRestrictions = normalizeList(prefs.dietaryRestrictions, 12);

    const available = new Set([...pantry, ...vegetables]);
    const ranked = RECIPES.filter((recipe) =>
      recipeSupportsRestrictions(recipe, dietaryRestrictions)
    ).map((recipe) => scoreRecipe(recipe, available, prefs));

    const makeNow = ranked
      .filter((item) => item.missingRequired.length === 0)
      .sort((a, b) => b.score - a.score || a.timeMins - b.timeMins || a.name.localeCompare(b.name))
      .slice(0, 5);

    const withFewMissing = ranked
      .filter((item) => item.missingRequired.length > 0 && item.missingRequired.length <= 2)
      .sort(
        (a, b) =>
          a.missingRequired.length - b.missingRequired.length ||
          b.score - a.score ||
          a.timeMins - b.timeMins ||
          a.name.localeCompare(b.name)
      )
      .slice(0, 5);

    return json(res, 200, { makeNow, withFewMissing, appliedRestrictions: dietaryRestrictions });
  } catch (error) {
    return json(res, 500, { error: error?.message || "Failed to generate recommendations" });
  }
}

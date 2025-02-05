const fetch = require("node-fetch");

exports.handler = async function () {
    // Load Cloudinary credentials from environment variables
    const cloudinaryAccounts = {
        art: { 
            cloudName: process.env.CLOUDINARY_ART_NAME, 
            apiKey: process.env.CLOUDINARY_ART_API_KEY, 
            apiSecret: process.env.CLOUDINARY_ART_API_SECRET 
        },
        social_sciences: { 
            cloudName: process.env.CLOUDINARY_SOCIAL_NAME, 
            apiKey: process.env.CLOUDINARY_SOCIAL_API_KEY, 
            apiSecret: process.env.CLOUDINARY_SOCIAL_API_SECRET 
        },
        science: { 
            cloudName: process.env.CLOUDINARY_SCIENCE_NAME, 
            apiKey: process.env.CLOUDINARY_SCIENCE_API_KEY, 
            apiSecret: process.env.CLOUDINARY_SCIENCE_API_SECRET 
        },
        assignment: { 
            cloudName: process.env.CLOUDINARY_ASSIGNMENT_NAME, 
            apiKey: process.env.CLOUDINARY_ASSIGNMENT_API_KEY, 
            apiSecret: process.env.CLOUDINARY_ASSIGNMENT_API_SECRET 
        }
    };

    let allBooks = [];

    // Fetch books from each Cloudinary account
    for (const [category, creds] of Object.entries(cloudinaryAccounts)) {
        if (!creds.cloudName || !creds.apiKey || !creds.apiSecret) {
            console.error(`Missing credentials for ${category}`);
            continue; // Skip this category if credentials are missing
        }

        const url = `https://api.cloudinary.com/v1_1/${creds.cloudName}/resources/search?expression=resource_type:raw`;
        const auth = "Basic " + Buffer.from(`${creds.apiKey}:${creds.apiSecret}`).toString("base64");

        try {
            const response = await fetch(url, { headers: { Authorization: auth } });
            if (!response.ok) throw new Error(`Failed to fetch from ${category}`);

            const data = await response.json();

            data.resources.forEach(file => {
                const fileName = file.public_id.split("/").pop();
                const pathParts = file.public_id.split("/");

                const subcategory = pathParts.length > 1 ? pathParts[pathParts.length - 2] : "General";
                const level = pathParts.length > 2 ? pathParts[pathParts.length - 3] : "All";

                allBooks.push({
                    title: fileName.replace(/_/g, " "),
                    url: file.secure_url,
                    category: category,
                    subcategory: subcategory,
                    level: level,
                    size: (file.bytes / 1024 / 1024).toFixed(2) + " MB"
                });
            });
        } catch (error) {
            console.error(`Error fetching from ${category}:`, error);
        }
    }

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",  // ✅ Allow all origins
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        },
        body: JSON.stringify(allBooks),
    };
};

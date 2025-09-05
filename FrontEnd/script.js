// Global variables
let originalImage = null;
let enhancedImages = {
	histogram: null,
	noiseReduction: null,
	edgeEnhancement: null,
	colorSpace: null,
};
let plantInfo = {
	name: null,
	confidence: null,
};

// DOM Elements
const imageInput = document.getElementById("image-input");
const uploadBtn = document.getElementById("upload-btn");
const fileNameDisplay = document.getElementById("file-name");
const originalImageSection = document.getElementById("original-image-section");
const originalImageElement = document.getElementById("original-image");
const processBtn = document.getElementById("process-btn");
const processingSection = document.getElementById("processing-section");
const boostContrastSection = document.getElementById("boost-contrast-section");
const smoothSoftenSection = document.getElementById("smooth-soften-section");
const edgeSharpenSection = document.getElementById("edge-sharpen-section");
const colorPopSection = document.getElementById("color-pop-section");
const boostContrastRadio = document.querySelector(".boost-contrast");
const smoothSoftenRadio = document.querySelector(".smooth-soften");
const edgeSharpenRadio = document.querySelector(".edge-sharpen");
const colorPopRadio = document.querySelector(".color-pop");

// Enhancement elements
const enhancedImage1Element = document.getElementById("enhanced-image1");
const enhancedImage2Element = document.getElementById("enhanced-image2");
const enhancedImage3Element = document.getElementById("enhanced-image3");
const enhancedImage4Element = document.getElementById("enhanced-image4");

// Plant identification elements
const plantImageElement = document.getElementById("plant-image");
const plantInfoElement = document.getElementById("plant-info");
const plantNameElement = document.getElementById("plant-name");
const plantConfidenceElement = document.getElementById("confidence-value");

// Final display elements
const finalOriginalElement = document.getElementById("final-original");
const finalEnhanced1Element = document.getElementById("final-enhanced1");
const finalEnhanced2Element = document.getElementById("final-enhanced2");
const finalEnhanced3Element = document.getElementById("final-enhanced3");
const finalEnhanced4Element = document.getElementById("final-enhanced4");
const finalPlantNameElement = document.getElementById("final-plant-name");
const finalConfidenceElement = document.getElementById(
	"final-confidence-value"
);

// Tab navigation
const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

// Initialize the application
document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
	console.log("App initialized");

	// Image upload handling
	uploadBtn.addEventListener("click", function () {
		console.log("Upload button clicked");
		imageInput.click();
	});

	imageInput.addEventListener("change", handleImageUpload);

	// Radio button handling
	boostContrastRadio.addEventListener("change", async function () {
		if (this.checked) {
			boostContrastSection.classList.remove("hidden");
			smoothSoftenSection.classList.add("hidden");
			edgeSharpenSection.classList.add("hidden");
			colorPopSection.classList.add("hidden");
			processingSection.classList.add("hidden");

			// Process the image if not already processed
			if (!enhancedImages.histogram && originalImage) {
				const loader = boostContrastSection.querySelector(".loader");
				loader.classList.remove("hidden");
				await handleProcessImage();
				loader.classList.add("hidden");
			}

			// Show histogram processed image
			const histogramImage = document.getElementById("boost-contrast-image");
			if (enhancedImages.histogram) {
				histogramImage.src = enhancedImages.histogram;
				histogramImage.classList.remove("hidden");
			}
		}
	});

	smoothSoftenRadio.addEventListener("change", async function () {
		if (this.checked) {
			boostContrastSection.classList.add("hidden");
			smoothSoftenSection.classList.remove("hidden");
			edgeSharpenSection.classList.add("hidden");
			colorPopSection.classList.add("hidden");
			processingSection.classList.add("hidden");

			// Process the image if not already processed
			if (!enhancedImages.noiseReduction && originalImage) {
				const loader = smoothSoftenSection.querySelector(".loader");
				loader.classList.remove("hidden");
				await handleProcessImage();
				loader.classList.add("hidden");
			}

			// Show noise reduction processed image
			const noiseReductionImage = document.getElementById(
				"smooth-soften-image"
			);
			if (enhancedImages.noiseReduction) {
				noiseReductionImage.src = enhancedImages.noiseReduction;
				noiseReductionImage.classList.remove("hidden");
			}
		}
	});

	edgeSharpenRadio.addEventListener("change", async function () {
		if (this.checked) {
			boostContrastSection.classList.add("hidden");
			smoothSoftenSection.classList.add("hidden");
			edgeSharpenSection.classList.remove("hidden");
			colorPopSection.classList.add("hidden");
			processingSection.classList.add("hidden");

			// Process the image if not already processed
			if (!enhancedImages.edgeEnhancement && originalImage) {
				const loader = edgeSharpenSection.querySelector(".loader");
				loader.classList.remove("hidden");
				await handleProcessImage();
				loader.classList.add("hidden");
			}

			// Show edge enhancement processed image
			const edgeEnhancementImage =
				document.getElementById("edge-sharpen-image");
			if (enhancedImages.edgeEnhancement) {
				edgeEnhancementImage.src = enhancedImages.edgeEnhancement;
				edgeEnhancementImage.classList.remove("hidden");
			}
		}
	});

	colorPopRadio.addEventListener("change", async function () {
		if (this.checked) {
			boostContrastSection.classList.add("hidden");
			smoothSoftenSection.classList.add("hidden");
			edgeSharpenSection.classList.add("hidden");
			colorPopSection.classList.remove("hidden");
			processingSection.classList.add("hidden");

			// Process the image if not already processed
			if (!enhancedImages.colorSpace && originalImage) {
				const loader = colorPopSection.querySelector(".loader");
				loader.classList.remove("hidden");
				await handleProcessImage();
				loader.classList.add("hidden");
			}

			// Show color space enhancement processed image
			const colorSpaceImage = document.getElementById("color-pop-image");
			if (enhancedImages.colorSpace) {
				colorSpaceImage.src = enhancedImages.colorSpace;
				colorSpaceImage.classList.remove("hidden");
			}
		}
	});

	// Process button
	processBtn.addEventListener("click", handleProcessImage);
	imageBoost.addEventListener("click", handleProcessImage);

	// Tab navigation
	tabBtns.forEach((btn) => {
		btn.addEventListener("click", function () {
			const tabId = this.getAttribute("data-tab");
			switchTab(tabId);
		});
	});
}

// Image Upload Handler
function handleImageUpload(e) {
	console.log("File input change event triggered");
	const file = e.target.files[0];
	if (!file) {
		console.log("No file selected");
		return;
	}

	console.log("File selected:", file.name);
	fileNameDisplay.textContent = file.name;

	const reader = new FileReader();
	reader.onload = function (event) {
		originalImageElement.src = event.target.result;
		originalImage = event.target.result;

		// Show original image section
		originalImageSection.classList.remove("hidden");

		// Reset processing section
		processingSection.classList.add("hidden");

		console.log("Image loaded successfully");
	};
	reader.readAsDataURL(file);
}

// Process Image Handler
async function handleProcessImage() {
	if (!originalImage) {
		alert("Please upload an image first");
		return;
	}

	try {
		console.log("Sending image to backend...");
		console.log("Backend URL:", "http://localhost:5000/process");

		// Send the image to the backend for processing
		const response = await fetch("http://localhost:5000/process", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				image: originalImage,
			}),
		});

		console.log("Response status:", response.status);
		console.log("Response headers:", response.headers);

		if (!response.ok) {
			const errorData = await response.json();
			console.error("Server error:", errorData);
			throw new Error(errorData.error || `Server error: ${response.status}`);
		}

		const data = await response.json();
		console.log("Processing successful:", data);

		if (!data.enhanced_images) {
			throw new Error("No enhanced images received from server");
		}

		// Update the enhanced images with the response
		enhancedImages = data.enhanced_images;

		// Keep processing section hidden
		processingSection.classList.add("hidden");
	} catch (error) {
		console.error("Error details:", error);
		alert(
			`Error processing image: ${error.message}\n\nPlease make sure the Python backend server is running on port 5000.`
		);
	}
}

// Update UI with results
function updateResultsUI() {
	// Set enhanced images
	enhancedImage1Element.src = enhancedImages.histogram;
	enhancedImage2Element.src = enhancedImages.noiseReduction;
	enhancedImage3Element.src = enhancedImages.edgeEnhancement;
	enhancedImage4Element.src = enhancedImages.colorSpace;

	// Set plant identification
	plantImageElement.src = originalImage;
	plantNameElement.textContent = plantInfo.name;
	plantConfidenceElement.textContent = plantInfo.confidence;
	plantInfoElement.classList.remove("hidden");

	// Set final display images
	finalOriginalElement.src = originalImage;
	finalEnhanced1Element.src = enhancedImages.histogram;
	finalEnhanced2Element.src = enhancedImages.noiseReduction;
	finalEnhanced3Element.src = enhancedImages.edgeEnhancement;
	finalEnhanced4Element.src = enhancedImages.colorSpace;
	finalPlantNameElement.textContent = plantInfo.name;
	finalConfidenceElement.textContent = plantInfo.confidence;
}

// Tab Navigation
function switchTab(tabId) {
	tabBtns.forEach((btn) => {
		if (btn.getAttribute("data-tab") === tabId) {
			btn.classList.add("active");
		} else {
			btn.classList.remove("active");
		}
	});

	tabContents.forEach((content) => {
		if (content.id === tabId) {
			content.classList.add("active");
		} else {
			content.classList.remove("active");
		}
	});
}

// Dark mode
const toggle = document.getElementById("input");

toggle.addEventListener("change", () => {
	document.body.classList.toggle("dark-mode", toggle.checked);
});

// Adding download functionality for processed images
document
	.getElementById("download-boost-contrast")
	.addEventListener("click", function () {
		downloadImage(
			document.getElementById("boost-contrast-image").src,
			"boost-contrast-result.png"
		);
	});

document
	.getElementById("download-smooth-soften")
	.addEventListener("click", function () {
		downloadImage(
			document.getElementById("smooth-soften-image").src,
			"smooth-soften-result.png"
		);
	});

document
	.getElementById("download-edge-sharpen")
	.addEventListener("click", function () {
		downloadImage(
			document.getElementById("edge-sharpen-image").src,
			"edge-sharpen-result.png"
		);
	});

document
	.getElementById("download-color-pop")
	.addEventListener("click", function () {
		downloadImage(
			document.getElementById("color-pop-image").src,
			"color-pop-result.png"
		);
	});

function downloadImage(url, filename) {
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

document.querySelector(".floating-button").addEventListener("click", () => {
	// Refresh the page
	location.reload();
});

// Show the floating button only after a radio button is selected
const radioButtons = document.querySelectorAll(".radio input");
const floatingButtonContainer = document.querySelector(
	".floating-button-container"
);

radioButtons.forEach((radio) => {
	radio.addEventListener("change", () => {
		floatingButtonContainer.style.display = "block";
	});
});

// Initially hide the floating button
floatingButtonContainer.style.display = "none";
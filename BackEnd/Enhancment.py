from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import io
from PIL import Image
from scipy.ndimage import gaussian_filter

app = Flask(__name__)
CORS(app)

def process_image_color_space(image_data):
    try:
        # Convert base64 image data to OpenCV format
        image_bytes = base64.b64decode(image_data.split(',')[1])
        image = Image.open(io.BytesIO(image_bytes))
        image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

        # Convert to LAB color space
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)

        # Split LAB channels
        L, A, B = cv2.split(lab)

        # Apply CLAHE on the L channel
        clahe = cv2.createCLAHE(clipLimit=4.0, tileGridSize=(8, 8))
        L_enhanced = clahe.apply(L)

        # Merge enhanced L with original A and B
        lab_enhanced = cv2.merge((L_enhanced, A, B))

        # Convert back to BGR
        enhanced_image = cv2.cvtColor(lab_enhanced, cv2.COLOR_LAB2BGR)

        # Convert back to base64
        _, buffer = cv2.imencode('.jpg', enhanced_image)
        enhanced_base64 = base64.b64encode(buffer).decode('utf-8')

        return f"data:image/jpeg;base64,{enhanced_base64}"
    except Exception as e:
        print(f"Error in color space enhancement: {str(e)}")
        raise

def process_image_laplacian_filter(image_data):
    try:
        # Convert base64 image data to OpenCV format
        image_bytes = base64.b64decode(image_data.split(',')[1])
        image = Image.open(io.BytesIO(image_bytes))
        image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

        # Convert to grayscale
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        kernel = np.array([[0, 1, 0],
                           [1, -4, 1],
                           [0, 1, 0]])

        laplacian_image = cv2.filter2D(src=gray_image, ddepth=-1, kernel=kernel)

        # Convert back to BGR for consistency
        laplacian_colored = cv2.cvtColor(laplacian_image, cv2.COLOR_GRAY2BGR)

        # Convert back to base64
        _, buffer = cv2.imencode('.jpg', laplacian_colored)
        enhanced_base64 = base64.b64encode(buffer).decode('utf-8')

        return f"data:image/jpeg;base64,{enhanced_base64}"
    except Exception as e:
        print(f"Error in Laplacian filter processing: {str(e)}")
        raise

def histogram_enhancement(image_data):
    try:
        # Convert base64 image data to OpenCV format
        image_bytes = base64.b64decode(image_data.split(',')[1])
        image = Image.open(io.BytesIO(image_bytes))
        image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Convert to grayscale
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Apply histogram equalization
        equalized_image = cv2.equalizeHist(gray_image)
        
        # Convert back to BGR for consistency
        equalized_colored = cv2.cvtColor(equalized_image, cv2.COLOR_GRAY2BGR)

        # Convert back to base64
        _, buffer = cv2.imencode('.jpg', equalized_colored)
        enhanced_base64 = base64.b64encode(buffer).decode('utf-8')

        return f"data:image/jpeg;base64,{enhanced_base64}"
    except Exception as e:
        print(f"Error in histogram enhancement: {str(e)}")
        raise

def calculate_sigma(image):
    """
    Calculate optimal sigma value based on image analysis
    Args:
        image: Input image (color or grayscale)
    Returns:
        Optimal sigma value for Gaussian filter
    """
    # Convert to grayscale if color image
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image

    # Calculate noise level (standard deviation normalized to [0,1])
    noise_level = np.std(gray) / 255.0

    # Calculate edge density using Canny edge detection
    edges = cv2.Canny(gray, 50, 150)
    edge_density = np.mean(edges) / 255.0

    # Smart sigma formula - balances noise reduction and detail preservation
    base_sigma = 0.5  # Base smoothing level
    sigma = base_sigma + (noise_level * 1.5) - (edge_density * 0.8)

    # Keep sigma within practical bounds
    return np.clip(sigma, 0.3, 2.0)

def apply_adaptive_gaussian(image_data):
    try:
        # Convert base64 image data to OpenCV format
        image_bytes = base64.b64decode(image_data.split(',')[1])
        image = Image.open(io.BytesIO(image_bytes))
        image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Convert from BGR to RGB for processing
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Calculate optimal sigma for this image
        sigma = calculate_sigma(image_rgb)
        
        # Apply Gaussian filter
        smoothed_image = gaussian_filter(image_rgb, sigma=sigma)
        
        # Convert back to BGR for consistency
        smoothed_bgr = cv2.cvtColor(smoothed_image.astype(np.uint8), cv2.COLOR_RGB2BGR)
        
        # Convert back to base64
        _, buffer = cv2.imencode('.jpg', smoothed_bgr)
        enhanced_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return f"data:image/jpeg;base64,{enhanced_base64}"
    except Exception as e:
        print(f"Error in adaptive Gaussian filtering: {str(e)}")
        raise

@app.route('/process', methods=['POST'])
def process_image():
    try:
        data = request.json
        if not data or 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400

        # Process the image with color space enhancement and edge detection
        enhanced_images = {
            'histogram': histogram_enhancement(data['image']),
            'noiseReduction': apply_adaptive_gaussian(data['image']),
            'edgeEnhancement': process_image_laplacian_filter(data['image']),
            'colorSpace': process_image_color_space(data['image'])
        }

        return jsonify({
            'enhanced_images': enhanced_images,
            'message': 'Image processed successfully'
        })
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)



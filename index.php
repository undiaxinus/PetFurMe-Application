<?php
// Simple landing page for PetFurMe app
$userAgent = $_SERVER['HTTP_USER_AGENT'];
$isAndroid = stripos($userAgent, 'android') !== false;
$isIOS = stripos($userAgent, 'iphone') !== false || stripos($userAgent, 'ipad') !== false;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PetFurMe - Download Our App</title>
    <link rel="icon" href="data:,">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            color: #333;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
            text-align: center;
        }
        .logo {
            width: 150px;
            height: auto;
            margin-bottom: 30px;
        }
        h1 {
            color: #8146C1;
            margin-bottom: 15px;
            font-size: 32px;
        }
        p {
            margin-bottom: 25px;
            font-size: 18px;
        }
        .download-section {
            margin: 40px 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
        }
        .download-button {
            background-color: #8146C1;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            font-size: 18px;
            transition: background-color 0.3s;
            width: 80%;
            max-width: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .download-button:hover {
            background-color: #6a3a9e;
        }
        .features {
            margin: 40px 0;
            text-align: left;
            background-color: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .feature {
            margin-bottom: 15px;
            display: flex;
            align-items: flex-start;
        }
        .feature-icon {
            margin-right: 15px;
            font-size: 24px;
            color: #8146C1;
        }
        .feature-text {
            flex: 1;
        }
        .feature-text h3 {
            margin: 0 0 5px 0;
        }
        .feature-text p {
            margin: 0;
            font-size: 16px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="assets/images/logo.png" alt="PetFurMe" class="logo" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🐾</text></svg>'; this.onerror=null;">
        
        <h1>PetFurMe</h1>
        <p>Your complete pet care management solution</p>
        
        <div class="download-section">
            <p><strong>Download our app to get started</strong></p>
            
            <?php if ($isAndroid): ?>
                <a href="https://play.google.com/store/apps/details?id=com.petfurme" class="download-button" style="background-color: #4CAF50;">Get on Google Play</a>
            <?php elseif ($isIOS): ?>
                <a href="https://apps.apple.com/app/petfurme/id123456789" class="download-button" style="background-color: #007AFF;">Download on App Store</a>
            <?php else: ?>
                <a href="/downloads/petfurme-latest.apk" class="download-button">Download Android APK</a>
                <a href="https://play.google.com/store/apps/details?id=com.petfurme" class="download-button" style="background-color: #4CAF50;">Get on Google Play</a>
                <a href="https://apps.apple.com/app/petfurme/id123456789" class="download-button" style="background-color: #007AFF;">Download on App Store</a>
            <?php endif; ?>
        </div>
        
        <div class="features">
            <h2 style="text-align: center; margin-bottom: 20px;">App Features</h2>
            
            <div class="feature">
                <div class="feature-icon">📋</div>
                <div class="feature-text">
                    <h3>Pet Profiles</h3>
                    <p>Create and manage detailed profiles for all your pets</p>
                </div>
            </div>
            
            <div class="feature">
                <div class="feature-icon">📅</div>
                <div class="feature-text">
                    <h3>Vet Appointments</h3>
                    <p>Schedule and track veterinary appointments</p>
                </div>
            </div>
            
            <div class="feature">
                <div class="feature-icon">💊</div>
                <div class="feature-text">
                    <h3>Medication Tracking</h3>
                    <p>Never miss a medication dose with reminders</p>
                </div>
            </div>
            
            <div class="feature">
                <div class="feature-icon">📱</div>
                <div class="feature-text">
                    <h3>User-Friendly Interface</h3>
                    <p>Easy to use for all pet owners</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
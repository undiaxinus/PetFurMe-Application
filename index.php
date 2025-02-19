<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PetFurMe</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            text-align: center;
            padding: 20px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 600px;
            width: 90%;
        }
        .logo {
            width: 150px;
            height: auto;
            margin-bottom: 20px;
        }
        h1 {
            color: #8146C1;
            margin-bottom: 15px;
        }
        .download-section {
            margin-top: 30px;
        }
        .download-button {
            background-color: #8146C1;
            color: white;
            padding: 12px 25px;
            border-radius: 25px;
            text-decoration: none;
            display: inline-block;
            margin: 10px;
            font-weight: bold;
            transition: background-color 0.3s;
        }
        .download-button:hover {
            background-color: #6a3a9e;
        }
        .api-status {
            margin-top: 20px;
            padding: 10px;
            border-radius: 5px;
            background-color: #e8f5e9;
            color: #2e7d32;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="assets/images/logo.png" alt="PetFurMe Logo" class="logo">
        <h1>Welcome to PetFurMe</h1>
        <p>Your one-stop solution for pet care management</p>
        
        <div class="download-section">
            <h2>Download Our App</h2>
            <p>Available for Android devices</p>
            <a href="#" class="download-button" id="androidButton">
                Download for Android
            </a>
        </div>

        <div class="api-status">
            API Status: 
            <?php
            try {
                $response = file_get_contents('api/health');
                echo "Online";
            } catch (Exception $e) {
                echo "Maintenance";
            }
            ?>
        </div>
    </div>

    <script>
        // Update this when you have the actual APK link
        document.getElementById('androidButton').addEventListener('click', function(e) {
            e.preventDefault();
            alert('App download will be available soon!');
        });
    </script>
</body>
</html>
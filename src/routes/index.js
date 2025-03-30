// Add a new route
{
    path: '/extract-photos',
    component: () => {
        fetch('/api/utils/extract_photos.php')
            .then(response => response.text())
            .then(data => {
                console.log(data);
                // Handle response
            });
        return '<div>Extracting photos...</div>';
    }
} 
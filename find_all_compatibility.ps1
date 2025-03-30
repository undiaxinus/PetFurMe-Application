Write-Host "Searching for ALL Java compatibility settings..." -ForegroundColor Green

# Search for toolchain usage
Write-Host "`nSearching for toolchain..." -ForegroundColor Yellow
Get-ChildItem -Path .\android -Include "*.gradle", "*.gradle.kts" -Recurse | 
    Select-String -Pattern "toolchain" | 
    ForEach-Object { Write-Host "$($_.Path): $($_.Line)" }

# Search for sourceCompatibility
Write-Host "`nSearching for sourceCompatibility..." -ForegroundColor Yellow
Get-ChildItem -Path .\android -Include "*.gradle", "*.gradle.kts" -Recurse | 
    Select-String -Pattern "sourceCompatibility" | 
    ForEach-Object { Write-Host "$($_.Path): $($_.Line)" }

# Search for targetCompatibility
Write-Host "`nSearching for targetCompatibility..." -ForegroundColor Yellow
Get-ChildItem -Path .\android -Include "*.gradle", "*.gradle.kts" -Recurse | 
    Select-String -Pattern "targetCompatibility" | 
    ForEach-Object { Write-Host "$($_.Path): $($_.Line)" }

# Search for JavaVersion
Write-Host "`nSearching for JavaVersion..." -ForegroundColor Yellow
Get-ChildItem -Path .\android -Include "*.gradle", "*.gradle.kts" -Recurse | 
    Select-String -Pattern "JavaVersion" | 
    ForEach-Object { Write-Host "$($_.Path): $($_.Line)" } 
# Find all JAVA_HOME settings
Write-Host "System JAVA_HOME: " -NoNewline
[System.Environment]::GetEnvironmentVariable("JAVA_HOME", "Machine")

Write-Host "User JAVA_HOME: " -NoNewline
[System.Environment]::GetEnvironmentVariable("JAVA_HOME", "User")

Write-Host "Process JAVA_HOME: " -NoNewline
$env:JAVA_HOME

Write-Host "Searching for JAVA_HOME in registry..."
Get-ChildItem -Path HKLM:\ -Recurse -ErrorAction SilentlyContinue | 
    Where-Object { $_.Name -like "*Java*" } | 
    ForEach-Object { Write-Host $_.Name }

Write-Host "Searching for Java paths in batch files..."
Get-ChildItem -Path .\ -Include *.bat,*.cmd -Recurse | 
    Select-String -Pattern "JAVA_HOME" | 
    ForEach-Object { Write-Host $_.Path ": " $_.Line }
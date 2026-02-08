$ErrorActionPreference = "Stop"

$pemKey = "C:\Users\Carlo\Documents\esii\ale-focus-app.pem"
$ec2Ip = "52.54.148.4"
$remoteUser = "ec2-user"
$remoteDir = "/var/www/focus-api"
$serviceName = "focus-api"
$dest = "$remoteUser@$ec2Ip:$remoteDir"

Write-Host "1. Publishing Application..."
# Using --output instead of -o for clarity, and quoting path
dotnet publish "src/Focus.Api/Focus.Api.csproj" -c Release -r linux-x64 --self-contained false --output ./publish

if ($LASTEXITCODE -ne 0) {
    Write-Error "Publish failed!"
    exit 1
}

Write-Host "2. Stopping Remote Service..."
# Properly quoting the command to be executed remotely
ssh -i "$pemKey" -o StrictHostKeyChecking=no "$remoteUser@$ec2Ip" "sudo systemctl stop $serviceName"

Write-Host "3. Uploading Files..."
# Create directory
ssh -i "$pemKey" -o StrictHostKeyChecking=no "$remoteUser@$ec2Ip" "sudo mkdir -p $remoteDir && sudo chown $remoteUser:$remoteUser $remoteDir"

# Upload
# Note: scp in PowerShell can be tricky with path expansion.
# We use Resolve-Path to get the absolute path of the publish directory.
$publishPath = (Resolve-Path "./publish").Path
Write-Host "Uploading from: $publishPath to $dest"

# scp -r expects the folder itself or contents.
# To upload contents to the remote dir, we can do:
scp -i "$pemKey" -o StrictHostKeyChecking=no -r "$publishPath/*" "$dest"

Write-Host "4. Restarting Remote Service..."
ssh -i "$pemKey" -o StrictHostKeyChecking=no "$remoteUser@$ec2Ip" "sudo systemctl start $serviceName"

Write-Host "5. Verifying Service Status..."
ssh -i "$pemKey" -o StrictHostKeyChecking=no "$remoteUser@$ec2Ip" "sudo systemctl status $serviceName --no-pager"

Write-Host "Deployment Complete!"

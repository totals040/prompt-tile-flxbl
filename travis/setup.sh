echo "running setup process for ${{ github.repository }} "
#sf org login access-token --instance-url https://login.salesforce.com --no-prompt
sf data query --query "SELECT Id, Name FROM Account LIMIT 3"
echo "echoing setup process ran successfully"

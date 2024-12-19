echo "running setup process for ${{ github.repository }} "
#sf org login access-token --instance-url https://login.salesforce.com --no-prompt
sf data query --query "SELECT Id, Name FROM Account LIMIT 2" -o 00DWU00000CvjrA!AQEAQCbGr2.zorkibrHYjqMLo0yRoMcbeXkcvAygKz3fFabneRT.UQU_ZAfExqESQEpCuzJRyDjTsl1flkBKCc7uAF09pVij
echo "echoing setup process ran successfully"

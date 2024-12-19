echo "running setup process for ${{ github.repository }} 2"
#sf org login access-token --instance-url https://login.salesforce.com --no-prompt
#sf sgd:source:delta --to "HEAD" --from main --output .
echo "echoing setup process ran successfully 2"

echo "running setup process for ${{ github.repository }} 2"
sf org login access-token --instance-url ${{LOGIN_URL}} --no-prompt
sf sgd:source:delta --to "HEAD" --from main --output .
echo "echoing setup process ran successfully 2"

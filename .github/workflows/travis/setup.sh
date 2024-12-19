echo "echoing setup for ${{ github.repository }}  …"
sf org login access-token --instance-url ${{LOGIN_URL}} --no-prompt
echo "echoing setup ran successfully"

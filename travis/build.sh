echo "running build process for ${{ github.repository }}"
sf sgd:source:delta --to "HEAD" --from main --output .
echo "echoing build process ran successfully"
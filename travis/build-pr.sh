test_level() {
    APEX_TESTS=$(xq . < package/package.xml | jq -r '.Package.types | [.] | flatten | map(select(.name=="ApexClass")) | .[] | .members | [.] | flatten | map(select(. | index("*") | not)) | unique | join(" ")')
    if [ -n "$APEX_TESTS" ]
    then
     TEST_LEVEL="--test-level RunSpecifiedTests --tests $APEX_TESTS"
    else
     TEST_LEVEL=""
    fi
}
#VALIDATE_RESULTS_FOLDER="tests"
#mkdir -p "$VALIDATE_RESULTS_FOLDER"
#touch "$VALIDATE_RESULTS_FOLDER/temp.json"

sf sgd source delta --to "$BRANCH_TARGET" --from "$BRANCH_SOURCE" --output "." --source force-app/main
if grep -q '<types>' package/package.xml ; then
    test_level
    sf project deploy validate --manifest package/package.xml $TEST_LEVEL -o target_org --verbose
    #sf project deploy report --use-most-recent -o $1 --json > "$VALIDATE_RESULTS_FOLDER/temp.json"
else
    echo "There are no changes to validate"
fi
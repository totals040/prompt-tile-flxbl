test_level() {
    APEX_TESTS=$(xq . < package/package.xml | jq -r '.Package.types | [.] | flatten | map(select(.name=="ApexClass")) | .[] | .members | [.] | flatten | map(select(. | index("*") | not)) | unique | join(" ")')
    if [ -n "$APEX_TESTS" ]
    then
     TEST_LEVEL="--test-level RunSpecifiedTests --tests $APEX_TESTS"
    else
     TEST_LEVEL=""
    fi
}

sf sgd source delta --to "origin/"$BRANCH_TARGET --from "origin/"$BRANCH_SOURCE --output "." --source force-app
if grep -q '<types>' package/package.xml ; then
    test_level
    echo "running validate on $BRANCH_TARGET"
    sf project deploy validate --manifest package/package.xml $TEST_LEVEL -o target_org --verbose
else
    echo "There are no changes to validate"
fi
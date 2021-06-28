const github = require('@actions/github')
const core = require('@actions/core')
const { Octokit } = require('@octokit/rest')

try {
    const token = core.getInput('github_token')
    const target_branch = core.getInput('target_branch')
    const source_ref = core.getInput('source_ref', { required: false }) || github.context.sha
    let commit_message = core.getInput('commit_message')

    // const octokit = new github.getOctokit(token);
    const octokit = new Octokit({auth: token});

    const repo = github.context.repo

    commit_message = commit_message
        .replace('{source_ref}', source_ref)
        .replace('{target_branch}', target_branch);

    octokit.rest.repos.merge({
        owner: repo.owner,
        repo: repo.repo,
        base: target_branch,
        head: source_ref,
        commit_message: commit_message
    }).then(() => {
        console.log(`Merged ${source_ref} into ${target_branch}`)
    })

} catch (e) {
    core.setFailed(e.message)
}

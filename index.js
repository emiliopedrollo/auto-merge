const github = require('@actions/github')
const core = require('@actions/core')
const { Octokit } = require('@octokit/rest')

const token = core.getInput('github_token')
const target_branch = core.getInput('target_branch')
const source_ref = core.getInput('source_ref', { required: false }) || github.context.sha
let commit_message = core.getInput('commit_message')
const allow_fast_forward = core.getBooleanInput('allow_fast_forward', { required: false })
const force_fast_forward = core.getBooleanInput('force_fast_forward', { required: false })

const octokit = new Octokit({auth: token});
const repo = github.context.repo

const merge = async () => {

    commit_message = commit_message
        .replace('{source_ref}', source_ref)
        .replace('{target_branch}', target_branch);

    let mergeParams = {
        owner: repo.owner,
        repo: repo.repo,
        base: target_branch,
        head: source_ref,
        commit_message: commit_message || null
    }

    Object.keys(mergeParams).forEach((k) => mergeParams[k] == null && delete mergeParams[k])

    core.debug(`Trying to merge`)
    if (core.isDebug()) {
        console.log(mergeParams)
    }

    return await octokit.rest.repos.merge(mergeParams).then(() => {
        core.info(`Merged ${source_ref} into ${target_branch}`)
        return true
    }).catch((e) => {
        core.warning(e.toString())
        return false
    })
}

const fastForward = async () => {
    let fastForwardParams = {
        owner: repo.owner,
        repo: repo.repo,
        ref: `heads/${target_branch}`,
        sha: source_ref,
        force: force_fast_forward
    }

    Object.keys(fastForwardParams).forEach((k) => fastForwardParams[k] == null && delete fastForwardParams[k])

    core.debug(`Trying to fast-forward`)
    if (core.isDebug()) {
        console.log(fastForwardParams)
    }

    return await octokit.rest.git.updateRef(fastForwardParams).then(() => {
        core.info(`Fast-Forwarded ${source_ref} into ${target_branch}`)
        return true
    }).catch((e) => {
        core.warning(e.toString())
        return merge()
    })
}

try {
    (allow_fast_forward ? fastForward() : merge()).then((success) => {
        core.debug('Done')
        if (!success) {
            core.setFailed('Something went wrong')
        }
    })
} catch (e) {
    core.setFailed(e.message)
}

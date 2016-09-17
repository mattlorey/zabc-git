/* @flow */
import git from 'git-promise';

class Git {
  cwd: string;
  gitExec: string;
  options: {gitExec: string, cwd: string};

  constructor(cwd: string = '.', gitExec: string = 'git') {
    this.cwd = cwd;
    this.gitExec = gitExec;
    this.options = {gitExec, cwd};
  }

  status() {
    return git('status --porcelain', this.options)
      .then((status) => {
        const results = {
          untracked: [],
          staged: [],
          unstaged: [],
        };

        const re = /^([\ MADRCU\?\!]{1})([\ MDUA\?\!]{1})\ (.*)$/;
        status.split('\n').slice(0, -1).forEach((line) => {
          const matches = re.exec(line);
          if (matches === null) {
            console.log(`==> line that doesn't match '${line}`); // eslint-disable-line
            return;
          }
          const index = matches[1];
          const tree = matches[2];
          const path = matches[3];
          switch (index) {
            case 'M':
              results.staged.push({type: 'modified', path});
              break;
            case 'A':
              results.untracked.push({type: 'new file', path});
              break;
            case 'D':
              results.staged.push({type: 'deleted', path});
              break;
            case 'R':
              results.staged.push({type: 'renamed', path});
              break;
            case 'C':
              results.staged.push({type: 'copied', path});
              break;
            case 'U':
              // @TODO
              break;
            case '?':
              results.untracked.push({type: 'new file', path});
              break;
            case ' ':
            case '!':
              break;
            default:
              console.log('Unhandled git index status ', index, path); // eslint-disable-line
          }

          switch (tree) {
            case 'M':
              results.unstaged.push({type: 'modified', path});
              break;
            case 'A':
              // @TODO
              break;
            case 'D':
              results.unstaged.push({type: 'deleted', path});
              break;
            case 'U':
              // @TODO
              break;
            case '?':
            case '!':
            case ' ':
              break;
            default:
              console.log('Unhanlded git tree status ', tree, path); // eslint-disable-line
          }

        });

        return results;
      })
    .catch((error) => {
      console.log('==> error', error); // eslint-disable-line
    });
  }
}

export default Git;

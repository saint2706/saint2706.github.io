import { spawnSync } from 'node:child_process';
for (const [bin,args] of [
 ['git',['status','--short']],['git',['branch','--show-current']],
 ['git',['rev-parse','HEAD']],['git',['remote','-v']],
 ['node',['--version']],['pnpm',['--version']]
]) {
 const r=spawnSync(bin,args,{encoding:'utf8'});
 console.log(`$ ${bin} ${args.join(' ')}\n${(r.stdout||'').trim()}\nexit=${r.status}`);
 if(r.error) console.log(`error=${r.error.message}`);
}

const _0xa1b2 = require('crypto');
const _0xc3d4 = ['1b15f284ed93259682a5ac58584de7672b96b4828ab74fc855e2ed5deace9bd0','0f83ef7cf62ef50d40cf55347ca6b201'];
const _0xe5f6 = ['50b1d3e9ce50c547a84845149944c863','9c3a53a0e3f7faae1f6deac2cc66534b'];
const _0x7a8b = ['b81f8b752d0054153cdad27154aa8fec19fc17853ef14e53e7723874da85d59aee57a0965fa16fba7c0b9c736e31e035','3ffc9169eaf1422e6654da743a6d4058'];
const _0x9c0d = 'PrincipalRPSystem2025LucassXKey!';
function _0x1e2f(_0x3g4h){const _0x5i6j=_0xa1b2.createHash('sha256').update(_0x9c0d).digest();const _0x7k8l=Buffer.from(_0x3g4h[1],'hex');const _0x9m0n=Buffer.from(_0x3g4h[0],'hex');const _0x1o2p=_0xa1b2.createDecipheriv('aes-256-cbc',_0x5i6j,_0x7k8l);return Buffer.concat([_0x1o2p.update(_0x9m0n),_0x1o2p.final()]).toString('utf8');}
const _0x3q4r=_0x1e2f(_0xc3d4);
const _0x5s6t=_0x1e2f(_0xe5f6);
const _0x7u8v=_0x1e2f(_0x7a8b);
function _0x9w0x(){if(!_0x3q4r||!_0x5s6t||!_0x7u8v)process.exit(1);if(!_0x3q4r.includes(_0x5s6t))process.exit(1);return true;}
_0x9w0x();
module.exports={credit:_0x3q4r,author:_0x5s6t,statusCredit:_0x7u8v,verify:_0x9w0x};
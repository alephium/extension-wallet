(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[405],{7314:function(e,t,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/",function(){return n(1422)}])},1422:function(e,t,n){"use strict";n.r(t),n.d(t,{default:function(){return C}});var a,s=n(2322),r=n(7729),l=n.n(r),o=n(2784),i=n(1522),c=n(5794),d=n(4423),u=JSON.parse('{"version":"v2.3.3","name":"ShinyToken","bytecode":"0001180102020200071600b11601ab160013c3038d7ea4c68000a8","codeHash":"eb751581aa1fc6da7377f792446d49817a6627c1c41b30d1f83cb6ebb57492fa","fieldsSig":{"names":[],"types":[],"isMutable":[]},"eventsSig":[],"functions":[{"name":"transfer","usePreapprovedAssets":false,"useAssetsInContract":true,"isPublic":true,"paramNames":["to","amount"],"paramTypes":["Address","U256"],"paramIsMutable":[false,false],"returnTypes":[]}],"constants":[],"enums":[]}');class h extends d.ContractFactory{at(e){return new p(e)}constructor(...e){super(...e),this.tests={transfer:async e=>(0,d.testMethod)(this,"transfer",e)}}}let m=new h(d.Contract.fromJson(u,"","eb751581aa1fc6da7377f792446d49817a6627c1c41b30d1f83cb6ebb57492fa"));class p extends d.ContractInstance{async fetchState(){return(0,d.fetchContractState)(m,this)}constructor(e){super(e)}}var x=JSON.parse('{"version":"v2.3.3","name":"Transfer","bytecodeTemplate":"01010300000006{1}{2}0e0c{0}0100","fieldsSig":{"names":["shinyTokenId","to","amount"],"types":["ByteVec","Address","U256"],"isMutable":[false,false,false]},"functions":[{"name":"main","usePreapprovedAssets":true,"useAssetsInContract":false,"isPublic":true,"paramNames":[],"paramTypes":[],"paramIsMutable":[],"returnTypes":[]}]}');!function(e){async function t(e,t){let a=await n.txParamsForExecution(e,t);return await e.signAndSubmitExecuteScriptTx(a)}e.execute=t;var n=e.script=d.Script.fromJson(x)}(a||(a={}));let f=async e=>{let t=await (0,c.Ul)();if(!(null==t?void 0:t.explorerProvider))return console.log("Alephium explorer provider not initialized"),[];let n=[],a=await t.explorerProvider.addresses.getAddressesAddressTokens(e);for(let s of a){let a=n.find(e=>e.id===s),r=await t.explorerProvider.addresses.getAddressesAddressTokensTokenIdBalance(e,s);a?(a.balance.balance+=BigInt(r.balance),a.balance.lockedBalance+=BigInt(r.lockedBalance)):n.push({id:s,balance:{balance:BigInt(r.balance),lockedBalance:BigInt(r.lockedBalance)}})}return n},v=async e=>{let t=await (0,c.Ul)();if(!(null==t?void 0:t.explorerProvider)){console.log("Alephium explorer provider not initialized");return}let n=await t.explorerProvider.addresses.getAddressesAddressBalance(e);return n},b=async(e,t)=>{let n=await (0,c.Ul)();if(!(null==n?void 0:n.connectedAccount)||!(null==n?void 0:n.connectedNetworkId))throw Error("alephium object not initialized");return m.deploy(n,{initialFields:{},initialAttoAlphAmount:BigInt(11e17),issueTokenAmount:BigInt(e)})},g=async(e,t)=>{let n=await (0,c.Ul)();if(!(null==n?void 0:n.connectedAccount)||!(null==n?void 0:n.connectedNetworkId))throw Error("alephium object not initialized");return a.execute(n,{initialFields:{shinyTokenId:(0,d.binToHex)((0,d.contractIdFromAddress)(t)),to:n.connectedAccount.address,amount:BigInt(e)}})},j=async(e,t,n,a)=>{let s=await (0,c.Ul)();if(!(null==s?void 0:s.connectedAccount)||!(null==s?void 0:s.connectedNetworkId))throw Error("alephium object not initialized");return await s.signAndSubmitTransferTx({signerAddress:s.connectedAccount.address,destinations:[{address:t,attoAlphAmount:d.DUST_AMOUNT,tokens:[{id:e,amount:BigInt(n)}]}]})},y=async e=>{let t=await (0,c.Ul)();if(void 0!==t)return null==t?void 0:t.enableIfConnected({onDisconnected:e,networkId:"devnet"}).catch(e=>{console.error(e)})},w=async e=>{let t=await (0,c.Ul)();if(void 0!==t)return null==t?void 0:t.enable({onDisconnected:e,networkId:"devnet"}).catch(e=>{throw void console.error(e)})},A=async()=>{let e=await (0,c.Ul)();return null==e?void 0:e.disconnect()},k=async e=>{let t=await (0,c.Ul)();if(!(null==t?void 0:t.connectedAccount)||!(null==t?void 0:t.connectedNetworkId))throw Error("Alephium object not initialized");return await t.request({type:"AddNewToken",params:{id:e,networkId:"devnet",symbol:"",decimals:0,name:"",logoURI:""}})},S=()=>"http://localhost:23000",_=async(e,t)=>{let n=await (0,c.Ul)();if(!(null==n?void 0:n.connectedAccount)||!(null==n?void 0:n.connectedNetworkId))throw Error("Alephium object not initialized");return await n.signMessage({signerAddress:n.connectedAccount.address,message:e,messageHasher:t})};var T=n(719),N=n.n(T);let I=e=>{let{address:t}=e,[n,a]=(0,o.useState)("10"),[r,l]=(0,o.useState)(""),[u,h]=(0,o.useState)(""),[m,p]=(0,o.useState)(""),[x,y]=(0,o.useState)("alephium"),[w,A]=(0,o.useState)(),[T,I]=(0,o.useState)(""),[C,P]=(0,o.useState)("idle"),[F,E]=(0,o.useState)(""),[B,U]=(0,o.useState)(""),[H,M]=(0,o.useState)(""),[z,O]=(0,o.useState)([]),[D,J]=(0,o.useState)(),[W,q]=(0,o.useState)(),[L,X]=(0,o.useState)(!1),[G,R]=(0,o.useState)(),[V,Z]=(0,o.useState)(void 0),Q=["approve","pending"].includes(C),K=()=>{q(void 0),a("10"),X(!1)};(0,o.useEffect)(()=>{f(t).then(e=>{e.length>0&&R({value:e[0],label:e[0].id}),O(e)}),v(t).then(e=>{J(e)}),(0,c.Ul)().then(e=>{e&&Z(e)})},[t]),(0,o.useEffect)(()=>{(async()=>{if(T&&"pending"===C){if(E(""),null==V?void 0:V.nodeProvider){let e;let t=0;d.web3.setCurrentNodeProvider(V.nodeProvider),e=(0,d.subscribeToTxStatus)({pollingInterval:3e3,messageCallback:async n=>{switch(n.type){case"Confirmed":console.log("Transaction ".concat(T," is confirmed")),P("success"),L&&(console.log("reset mint token"),K()),null==e||e.unsubscribe();break;case"TxNotFound":console.log("Transaction ".concat(T," is not found")),t>3?(P("failure"),E("Transaction ".concat(T," not found")),null==e||e.unsubscribe()):await new Promise(e=>setTimeout(e,3e3)),t+=1;break;case"MemPooled":console.log("Transaction ".concat(T," is in mempool")),P("pending")}},errorCallback:(e,t)=>{console.log(e),P("failure");let n=e?"".concat(e):"No further details";return(null==e?void 0:e.response)&&(n=JSON.stringify(e.response,null,2)),E(n),t.unsubscribe(),Promise.resolve()}},T)}else throw Error("Alephium object is not initialized")}})()},[C,T,null==V?void 0:V.nodeProvider,L]);let Y="devnet",$=async e=>{e.preventDefault();try{P("approve"),console.log("mint",n);let e=await b(n,Y);console.log(e),q(e.contractInstance.address),I(e.txId),P("pending")}catch(e){console.error(e),P("idle")}},ee=async e=>{try{e.preventDefault(),P("approve"),console.log("transfer",{transferTo:r,transferAmount:u});let t=await j(H,r,u,Y);console.log(t),I(t.txId),P("pending")}catch(e){console.error(e),P("idle")}},et=async e=>{try{if(e.preventDefault(),W){P("approve"),console.log("transfer",{transferTo:r,transferAmount:u,mintedToken:W});let e=await g(n,W);I(e.txId),P("pending"),X(!0)}else throw Error("No minted token")}catch(e){console.error(e),P("idle")}},en=async e=>{try{e.preventDefault(),P("approve"),console.log("sign",m,x);let t=await _(m,x);console.log(t),A(t.signature),P("success")}catch(e){console.error(e),P("idle")}};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)("h3",{style:{margin:0},children:["Transaction status: ",(0,s.jsx)("code",{children:C})]}),T&&(0,s.jsxs)("h3",{style:{margin:0},children:["Transaction hash:"," ",(0,s.jsx)("a",{href:"".concat(S(),"/transactions/").concat(T),target:"_blank",rel:"noreferrer",style:{color:"blue",margin:"0 0 1em"},children:(0,s.jsx)("code",{children:T})})]}),F&&(0,s.jsxs)("h3",{style:{margin:0},children:["Transaction error:"," ",(0,s.jsx)("textarea",{style:{width:"100%",height:100,background:"white"},value:F,readOnly:!0})]}),(0,s.jsxs)("h3",{style:{margin:0},children:["ALPH Balance: ",(0,s.jsxs)("code",{children:[(null==D?void 0:D.balance)&&(0,d.prettifyAttoAlphAmount)(D.balance)," ALPH"]})]}),(0,s.jsx)("h3",{style:{margin:0},children:z.length>0?(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)("label",{children:["Token Balances (",z.length," tokens in total)"]}),(0,s.jsxs)("div",{className:"columns",children:[(0,s.jsx)(i.ZP,{value:G,onChange:e=>{e&&R(e)},options:z.map(e=>({value:e,label:e.id}))}),(0,s.jsx)("code",{children:null==G?void 0:G.value.balance.balance.toString()}),(0,s.jsx)("code",{children:(0,s.jsx)("button",{className:"flat",style:{marginLeft:".6em"},onClick:async()=>{try{if(null==G?void 0:G.value.id){let e=await k(null==G?void 0:G.value.id);e?U(""):U("Token exists")}}catch(e){U(e.message)}},children:"Add to wallet"})})]}),(0,s.jsx)("span",{className:"error-message",children:B})]}):(0,s.jsx)("div",{children:"No tokens"})}),(0,s.jsxs)("div",{className:"columns",children:[W&&(null==V?void 0:V.connectedAccount)?(0,s.jsxs)("form",{onSubmit:et,children:[(0,s.jsx)("h2",{className:N().title,children:"Withdraw all minted token"}),(0,s.jsx)("label",{htmlFor:"token-address",children:"Token Address"}),(0,s.jsx)("p",{children:W}),(0,s.jsx)("label",{htmlFor:"transfer-to",children:"To"}),(0,s.jsx)("input",{type:"text",id:"transfer-to",name:"fname",disabled:!0,value:V.connectedAccount.address,onChange:e=>l(e.target.value)}),(0,s.jsx)("label",{htmlFor:"transfer-amount",children:"Amount"}),(0,s.jsx)("input",{type:"number",id:"transfer-amount",name:"fname",disabled:!0,value:n,onChange:e=>h(e.target.value)}),(0,s.jsx)("br",{}),(0,s.jsx)("input",{type:"submit",disabled:Q,value:"Withdraw"})]}):(0,s.jsxs)("form",{onSubmit:$,children:[(0,s.jsx)("h2",{className:N().title,children:"Mint token"}),(0,s.jsx)("label",{htmlFor:"mint-amount",children:"Amount"}),(0,s.jsx)("input",{type:"number",id:"mint-amount",name:"fname",value:n,onChange:e=>a(e.target.value)}),(0,s.jsx)("input",{type:"submit"})]}),(0,s.jsxs)("form",{onSubmit:ee,children:[(0,s.jsx)("h2",{className:N().title,children:"Transfer token"}),(0,s.jsx)("label",{htmlFor:"transfer-token-address",children:"Token Id"}),(0,s.jsx)("input",{type:"text",id:"transfer-to",name:"fname",value:H,onChange:e=>M(e.target.value)}),(0,s.jsx)("label",{htmlFor:"transfer-to",children:"To"}),(0,s.jsx)("input",{type:"text",id:"transfer-to",name:"fname",value:r,onChange:e=>l(e.target.value)}),(0,s.jsx)("label",{htmlFor:"transfer-amount",children:"Amount"}),(0,s.jsx)("input",{type:"number",id:"transfer-amount",name:"fname",value:u,onChange:e=>h(e.target.value)}),(0,s.jsx)("br",{}),(0,s.jsx)("input",{type:"submit",disabled:Q,value:"Transfer"})]})]}),(0,s.jsxs)("div",{className:"columns",children:[(0,s.jsxs)("form",{onSubmit:en,children:[(0,s.jsx)("h2",{className:N().title,children:"Sign Message"}),(0,s.jsxs)("div",{className:"columns",children:[(0,s.jsx)("label",{htmlFor:"short-text",children:"Short Text"}),(0,s.jsx)("input",{type:"text",id:"short-text",name:"short-text",value:m,onChange:e=>p(e.target.value)})]}),(0,s.jsxs)("div",{className:"columns",children:[(0,s.jsx)("label",{htmlFor:"short-text",children:"Hasher"}),(0,s.jsxs)("select",{name:"hasher",id:"hasher",onChange:e=>y(e.target.value),children:[(0,s.jsx)("option",{value:"alephium",children:"Alephium"}),(0,s.jsx)("option",{value:"sha256",children:"Sha256"}),(0,s.jsx)("option",{value:"blake2b",children:"blake2b"})]})]}),(0,s.jsx)("input",{type:"submit",value:"Sign"})]}),(0,s.jsxs)("form",{children:[(0,s.jsx)("h2",{className:N().title,children:"Sign results"}),(0,s.jsx)("label",{htmlFor:"r",children:"Signature"}),(0,s.jsx)("textarea",{className:N().textarea,id:"signature",name:"signature",value:w,readOnly:!0})]})]})]})};var C=()=>{let[e,t]=(0,o.useState)(),[n,a]=(0,o.useState)(void 0),[r,i]=(0,o.useState)(!1);(0,o.useEffect)(()=>{let e=async()=>{r||y(()=>Promise.resolve(i(!1))).then(e=>{t(null==e?void 0:e.address),a("devnet"),i(!!e)})};(async()=>{await e()})()},[r]);let c=async()=>{let e=await w(()=>Promise.resolve(i(!1)));t(null==e?void 0:e.address),a("devnet"),i(!!e)},d=async()=>{await A(),t(void 0),a(void 0),i(!1)};return(0,s.jsxs)("div",{className:N().container,children:[(0,s.jsxs)(l(),{children:[(0,s.jsx)("title",{children:"Alephium Test dApp"}),(0,s.jsx)("link",{rel:"icon",href:"/favicon.ico"})]}),(0,s.jsx)("main",{className:N().main,children:r?(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)("button",{className:N().connect,onClick:d,children:"Disconnect"}),(0,s.jsxs)("h3",{style:{margin:0},children:["Wallet address: ",(0,s.jsx)("code",{children:e})]}),(0,s.jsxs)("h3",{style:{margin:0},children:["Network: ",(0,s.jsx)("code",{children:n})]}),e&&(0,s.jsx)(I,{address:e})]}):(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)("button",{className:N().connect,onClick:c,children:"Connect Wallet"}),(0,s.jsx)("p",{children:"First connect wallet to use dapp."})]})})]})}},719:function(e){e.exports={container:"Home_container__Ennsq",main:"Home_main__EtNt2",connect:"Home_connect__28DRU",title:"Home_title__FX7xZ",description:"Home_description__Qwq1f",code:"Home_code__aGV0U",grid:"Home_grid__c_g6N",card:"Home_card__7oz7W",logo:"Home_logo__80mSr",textarea:"Home_textarea__3BgG_"}},7352:function(){},7695:function(){},3196:function(){},8087:function(){},488:function(){}},function(e){e.O(0,[934,730,774,888,179],function(){return e(e.s=7314)}),_N_E=e.O()}]);
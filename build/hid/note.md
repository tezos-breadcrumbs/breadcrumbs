From: https://github.com/vercel/pkg/discussions/1623#discussioncomment-2729625

In summary ::
if you see below error , it means pkg could not run prebuild-install to download and make a copy of the ".node" binary file, you can console.log in the pkg module's lib-es5/producer.js file find a function called "nativePrebuildInstall", add console.log(nativeFile); to get the name of .node copy which pkg wanted, then manually copy paste the original .node file, the error will be gone. BUT this only let you get current platform node, you can use "prebuild-install" to get different platfofm binary.
prebuild-install failed[D:\projects\galaxy108\game\node_modules\node-datachannel\build\Release\node_datachannel.node]: spawnSync D:\projects\galaxy108\game\node_modules\pkg\node_modules\.bin\prebuild-install ENOENT

if you see above macos UNEXPECTED-15 error, add console.log to pkg/prelude/bootstrap.js function "payloadCopyUni" console.log("source, target"), also search for "UNEXPECTED-15" string, above the if(entityContent), add console.log(STORE_CONTENT, entity, entityContent), then run macos build app again, it should give you enough information about which file is missing.
This approach also works on pc but you need to use terminal to run app by typing ./appName.exe. It disappears if open by double licking the exe file.

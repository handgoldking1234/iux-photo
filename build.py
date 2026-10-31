import os
import pathlib
R=str(pathlib.Path(__file__).resolve().parent)+'/'
import base64
font=base64.b64encode(open(R+'node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2','rb').read()).decode()
css=open(R+'src/style.css').read()+open(R+'src/il/style.css').read()+'\n@font-face{font-family:"Pretendard";src:url(data:font/woff2;base64,'+font+') format("woff2");font-weight:45 920;font-style:normal;font-display:block}\n'
body=open(R+'src/body.html').read()+open(R+'src/il/body.html').read()
js='\n'.join(open(R+'src/js/'+f).read() for f in sorted(os.listdir(R+'src/js')))
head='<title>IUX Photo</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'
cdn=('<script src="https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js"></script>\n'
     '<script src="https://cdn.jsdelivr.net/npm/utif@3.1.0/UTIF.js"></script>\n'
     '<script src="https://cdn.jsdelivr.net/npm/ag-psd@31.0.3/dist/bundle.js"></script>\n'
     '<script src="https://cdn.jsdelivr.net/npm/paper@0.12.18/dist/paper-core.min.js"></script>\n')
os.makedirs(R+'dist',exist_ok=True)
art=head+'<style>\n'+css+'\n</style>\n'+body+'\n'+cdn+'<script>\n'+js+'\n</script>\n'
open(R+'dist/artifact.html','w').write(art)
def inl(p): return '<script>\n'+open(R+p).read().replace('</script','<\\/script')+'\n</script>\n'
local=('<!doctype html>\n<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'+head+
 '<style>\n'+css+'\n</style></head><body>\n'+body+'\n'+inl('node_modules/pako/dist/pako.min.js')+inl('node_modules/utif/UTIF.js')+inl('node_modules/ag-psd/dist/bundle.js')+inl('node_modules/paper/dist/paper-core.min.js')+'<script>\n'+js+'\n</script>\n</body></html>\n')
open(R+'index.html','w').write(local)
print(len(art),len(local))

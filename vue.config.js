import { defineConfig } from '@vue/cli-service'
export default defineConfig({
    publicPath: '',
    outputDir: 'cordova/www',
    pluginOptions: {
        cordovaPath: 'cordova'
    }
})

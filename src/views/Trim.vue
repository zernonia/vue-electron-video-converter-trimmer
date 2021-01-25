<template>
  <div class="trimmer">
    <h1>Video Trimmer</h1>
    <div style="height: 450px; width: 800px">
      <!-- <video-player style="width: 100%; height: 100%" :options="options"></video-player> -->
      <video controls width="100%" height="100%" ref="video" @timeupdate="checkLoop" :src="options.sources[0].src"></video>
    </div>
    
    <div style="width: 800px;"> 
      <el-slider v-model="trimInfo" :step="0.01" range :max="videoLength || 100" />
      <div style="display: flex; justify-content: space-between;">
        <el-input-number v-model="trimInfo[0]" :min="0" :max="trimInfo[1]"></el-input-number>
        <el-input-number v-model="trimInfo[1]" :min="0" :max="videoLength || 100"></el-input-number>
      </div>
    </div>
    <el-form ref="form" label-width="120px" style="width: 700px; display: block; margin-top: 2rem;">
      <el-form-item label="Input File">
        <div style="display: flex;">
          <el-input  placeholder="Select a file" v-model="filepath"></el-input>
          <el-button @click="clickedFile" type="primary" icon="el-icon-paperclip"></el-button>
        </div>
      </el-form-item>
      <el-form-item label="Output Directory">
        <div style="display: flex;">
          <el-input placeholder="Select the output" v-model="output"></el-input>
          <el-button @click="clickedFolder" type="primary" icon="el-icon-paperclip"></el-button>
        </div>
      </el-form-item>
      <el-form-item label="Output Extension">
        <el-select v-model="extension" placeholder="Select Extension" style="display: flex; width: 200px">
          <el-option
            v-for="(item, index) in extensionList"
            :key="index"
            :label="item"
            :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button :loading="converting" type="primary" plain @click="convertStream">Convert</el-button>
      </el-form-item>
    </el-form>
    <div style="width: 580px; margin-top: 2rem; margin-left: 120px">
      <div style="position: relative; height: 30px;">
        <el-progress style="padding-top: 3px;" :text-inside="true" :stroke-width="20" :percentage="progress"></el-progress>
        <el-button v-if="converting" @click="killProcess" style="position: absolute; right: 0; top: 0;" size="mini" type="danger" icon="el-icon-delete" circle></el-button>
      </div>
      <p style="color: #606266;">{{ duration }}s</p>
      <el-alert v-if="alert.title != ''" :title="alert.title" :type="alert.type" :description="alert.description" show-icon=""></el-alert>
    </div>
  </div>
</template>

<script>
// import videoPlayer from '@/components/Video.vue'
import ffmpeg from '../services/ffmpeg'
import path from 'path'
const { dialog } = require('electron').remote

export default {
  components: {
    // videoPlayer
  },
  data: () => ({
    options: {
      controls: true,
      fill: true,
      sources: [{
        src: "C:\\Users\\sians\\Download\\IMG_4698-0.046.mp4"
      }]
    },
    filepath: '',
    filename: '',
    extension: '',
    output: 'C:\\Coding\\',
    progress: 0,
    extensionList: ['.mov', '.mp4', '.avi'],
    converting: false,
    duration: 0,
    alert: {
      title: "",
      type: "",
      description: ""
    },
    command: new ffmpeg(),
    chunk: null,
    trimInfo: [0,0],
    videoLength: 0
  }),
  computed: {
    dest(){
      return __dirname
    }
  },
  methods: {
    clickedFolder() {
      var options = {
        title: "Select Folder",
        buttonLabel : "Select Folder",
        properties: ['openDirectory']
      }

      dialog.showOpenDialog( options ).then((filename) => {
        if(!filename.canceled){
          this.output = filename.filePaths[0]
        }
      })
    },
    clickedFile() {
      var options = {
        title: "Select Video",
        buttonLabel : "Select Video",
        properties: ['openFile'],
                
        filters :[
          {name: 'Video Files', extensions: ['mov','mp4','mts','mkv','avi']},
          {name: 'All Files', extensions: ['*']}
        ]
      }

      dialog.showOpenDialog( options ).then((filename) => {
        if(!filename.canceled){
          this.filepath = filename.filePaths[0]
          this.filename = path.basename(this.filepath, path.extname(this.filepath))
          this.output = path.dirname(this.filepath)
          this.options.sources[0].src = this.filepath
          this.extension == '' ? this.extension = path.extname(this.filepath) : ''

          ffmpeg.ffprobe(this.filepath, (error, metadata) => {
            console.log(metadata);
            this.trimInfo[1] = metadata.format.duration;
            this.videoLength = metadata.format.duration;
          });
        }
      })
    },
    killProcess() {
      this.command.kill()
    },
    convertStream() {
      let startTime = 0
      const duration = this.trimInfo[1] - this.trimInfo[0]
      let outputFilePath = this.output + '\\' + this.filename + Math.random()*1000 + this.extension
      
      this.command = ffmpeg(this.filepath)
        .setStartTime(this.trimInfo[0])
        .duration(duration)
        // .withVideoCodec('copy')
        // .withAudioCodec('copy')
        .on('start', (commandLine) => {
          this.converting = true
          startTime = Date.now()
          this.alert = {
            title: '',
            type: '',
            description: ''
          }
          console.log('Spawned Ffmpeg with command: ' + commandLine);
        })
        .on('progress', (progress) => {
          console.log(progress);
          this.duration = Math.round((Date.now() - startTime) / 1000)
          progress.percent > 0 ? this.progress = Math.round(progress.percent * 100) / 100 : ''
        })
        .on('error', (err) => {
          this.converting = false
          this.alert = {
            title: 'Convert failed',
            type: 'error',
            description: err.message
          }
        })
        .on('end', () =>{
          this.converting = false
          this.progress = 100
          this.alert = {
            title: 'Convert successful',
            type: 'success',
            description: `Files placed in ${outputFilePath}`
          }
        })
        
      this.command.saveToFile(outputFilePath);
    },
    checkLoop() {
      let timeframe = this.$refs.video.currentTime
      if(timeframe < this.trimInfo[0] || timeframe > this.trimInfo[1]) {
        console.log('firing');
        this.$refs.video.currentTime = this.trimInfo[0]
      }
    }
  }
}
</script>

<style>
.trimmer {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 1200px;
  background: white;
  padding: 2rem;
  border-radius: 20px;
}
</style>
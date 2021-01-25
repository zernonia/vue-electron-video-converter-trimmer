<template>
  <div class="home">
    <h1>h.265 to h.264 Converter</h1>
    <el-form ref="form" label-width="120px" style="width: 700px; display: block;">
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
      <el-button  style="margin-left: -120px;" :loading="converting" type="primary" plain @click="convert">Convert</el-button>
    </el-form-item>
  </el-form>
  <div style="width: 580px; margin-top: 1rem;">
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
// @ is an alias to /src
import ffmpeg from '../services/ffmpeg'
import path from 'path'
import fs from 'fs'
const { dialog } = require('electron').remote

export default {
  name: 'Home',
  data: () => ({
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
    command: new ffmpeg()
  }),
  methods: {
    convert() {
      if(this.filepath != ''){
        let outputFilePath = this.output + '\\' + this.filename + this.extension
        let startTime = 0
        if(fs.existsSync(outputFilePath)) {
          outputFilePath = this.output + '\\' + this.filename + '-' + Math.round(Math.random() * 1000) / 1000  + this.extension
        }
        this.command = ffmpeg()
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
          this.duration = Math.round((Date.now() - startTime) / 1000)
          progress.percent > 0 ? this.progress = Math.round(progress.percent * 100) / 100 : ''
        })
        .input(this.filepath)
        .audioCodec('copy')
        .videoCodec('libx264')
        .outputOption('-pix_fmt yuv420p')
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
        // .save(outputFilePath)

        this.command.save(outputFilePath)
      }
    },
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
          this.extension == '' ? this.extension = path.extname(this.filepath) : ''
        }
      })
    },
    killProcess() {
      this.command.kill()
    }
  }
}
</script>

<style>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 1200px;
  background: white;
  padding: 2rem;
  border-radius: 20px;
}
.pointer {
  cursor: pointer;
}
</style>
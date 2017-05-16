import { config } from '../../../config/index'
import { Action } from '../action'
import { Subtitle } from '../subtitle'


/**
 * 音频工厂类
 * @param {[type]} options [description]
 */
export default class AudioSuper {

  constructor() {}

  /**
   * 构建之前关数据
   * 2个回调处理
   *  1 内部manage
   *  2 外部content的行为音频
   *  二者只会同时存在一个
   */
  $$preRelated(trackId, options) {

    /*匹配URL地址*/
    this.$$url = config.getAudioPath() + options.url

    //在manager中附加，播放一次后删除这个对象
    this.innerCallback = options.innerCallback;

    /*按钮的反弹点击触发，设置按钮的行为*/
    if (trackId == 9999 && options.complete) {
      this.outerCallback = options.complete
    }
  }

  /**
   * 构建之后关数据
   * @param  {[type]} options     [description]
   * @param  {[type]} controlDoms [description]
   * @return {[type]}             [description]
   */
  $$afterRelated(options, controlDoms) {
    //音频重复播放次数
    if (options.data && options.data.repeat) {
      this.repeatNumber = Number(options.data.repeat)
    }
    //音频动作
    if (options.action) {
      this.acitonObj = Action(options);
    }
    //字幕对象
    if (options.subtitles && options.subtitles.length > 0) {
      this.subtitleObject = new Subtitle(options, controlDoms, (cb) => this.getAudioTime(cb))
    }
    //如果有外部回调处理
    if (this.outerCallback) {
      this.outerCallback.call(this);
    }
  }

  /**
   * 运行成功失败后处理方法
   * phoengap会调用callbackProcess
   * state
   *   true 成功回调
   *   false 失败回调
   */
  $$callbackProcess(state) {

    /**************************
        处理content的反馈回调
    ***************************/
    if (this.outerCallback) {
      this.end()
    } else {

      /**************************
       内部播放的回调，manage的处理
      ***************************/
      /*播放失败*/
      if (!state) {
        this.innerCallback && this.innerCallback(this);
        return
      }

      /*如果有需要重复的音频*/
      if (this.repeatNumber) {
        --this.repeatNumber
        this.play()
      } else {
        /*如果不存在重复，那么播放完毕后，直接清理这个对象*/
        this.innerCallback && this.innerCallback(this);
      }
    }

  }


  /**
   * 播放
   * @return {[type]} [description]
   */
  $$play() {
    //flash模式不执行
    if (this.audio && !this.isFlash) {
      this.status = 'playing';
      //支持自动播放,微信上单独处理
      if (Xut.plat.hasAutoPlayAudio && window.WeixinJSBridge) {
        window.WeixinJSBridge.invoke('getNetworkType', {}, (e) => {
          this.audio.play();
        })
      } else {
        this.audio.play && this.audio.play();
      }
    }
    this.acitonObj && this.acitonObj.play();
  }

  /**
   * 停止
   * @return {[type]} [description]
   */
  $$pause() {
    this.status = 'paused';
    this.audio && this.audio.pause && this.audio.pause();
    this.acitonObj && this.acitonObj.pause();
  }

  /**
   * 销毁
   */
  $$destroy() {
    this.status = 'ended';
    //销毁字幕
    if (this.subtitleObject) {
      this.subtitleObject.destroy()
      this.subtitleObject = null;
    }
    //动作
    if (this.acitonObj) {
      this.acitonObj.destroy();
      this.acitonObj = null;
    }
  }

}
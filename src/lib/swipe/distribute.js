import { config } from '../config/index'

export default function distribute(Swipe) {

  /**
   * 处理松手后滑动
   * pageIndex 页面
   * distance  移动距离
   * speed     时间
   * viewTag   可使区标记
   * follow    是否为跟随滑动
   * @return {[type]} [description]
   */
  Swipe.prototype._distributeMove = function (data) {
    data.direction = this.direction
    data.orientation = this.orientation

    /*页码索引标识*/
    let pointer = this.pagePointer
    data.frontIndex = pointer.frontIndex
    data.backIndex = pointer.backIndex
    data.middleIndex = this.visualIndex

    this.$emit('onMove', data)
  }

  /*
  翻页结束后，派发动作完成事件
  1 还原动作参数
  2 触发翻页的内部事件监听
  3 延长获取更pagePointer的更新值，并且解锁
   */
  Swipe.prototype._distributeComplete = function (...arg) {
    this._setRestore(...arg)
    this.$emit('innerFlipOver')
    const callback = () => this.enable()
    setTimeout(() => {
      this.$emit('onComplete', {
        unlock: callback,
        direction: this.direction,
        pagePointer: this.pagePointer,
        isQuickTurn: this._isQuickTurn
      })
    }, 50)
  }


}

/** 
 * 观察者模式实现事件监听
 *
 * 使用方法
 * var EventObject = new Observer();
 * EventObject.dispatchEvent('GO_TO_BED');
 * EventObject.on('GO_TO_BED', function(name, hour) {
 *     console.group('Test Event');
 *     console.log(name + '要在' + hour + '点之前去睡觉，谁又懂得了码农的辛酸啊？');
 * });
 *
 * // 触发事件
 * EventObject.fireEvent('GO_TO_BED', 'goal', 12);
 *
 * 在有需要的时候可以将EventObject组合到其它类中来使用，或者模拟类的实现和继承，为代码解耦发力。
 */
function Observer() {
    // 对外发布的事件列表{"connect" : [{fn : null, scope : null}, {fn : null, scope : null}]}
    this._eventsList = {};
}

Observer.prototype = {
    // 空函数
    _emptyFn: function() {
    },
    
    /**
     * 判断事件是否已发布
     * @param eType 事件类型
     * @return Boolean
     */
    _hasDispatch: function(eType) {
        eType = (String(eType) || '').toLowerCase();

        return "undefined" !== typeof this._eventsList[eType];
    },
    
    /**
      * 根据事件类型查对fn所在的索引,如果不存在将返回-1
      * @param eType 事件类型
      * @param fn 事件句柄
      */
    _indexFn: function(eType, fn) {
        if(!this._hasDispatch(eType)) {
            return -1;
        }

        var list = this._eventsList[eType];
        fn = fn || '';
        for(var i = 0; i < list.length; i++) {
            var dict = list[i];
            var _fn  = dict.fn || '';
            if(fn.toString() === _fn.toString()) {
                return i;
            }
        }

        return -1;
    },

    /**
     * 创建委托
     */
    createDelegate: function() {
        var __method = this;
        var args     = Array.prototype.slice.call(arguments);
        var object   = args.shift();
        return function() {
            return __method.apply(object, args.concat(Array.prototype.slice.call(arguments)));
        }
    },
    
    /**
     * 发布事件
     */
    dispatchEvent: function() {
        if(arguments.length < 1)
        {
            return false;
        }

        var args = Array.prototype.slice.call(arguments), _this = this;
        $.each(args, function(index, eType){
            if(_this._hasDispatch(eType))
            {
                return true;
            }
            _this._eventsList[eType.toLowerCase()] = [];
        });

        return this;
    },
    
    /**
     * 触发事件
     */
    fireEvent : function() {
        if(arguments.length < 1) {
            return false;
        }

        var args = Array.prototype.slice.call(arguments), eType = args.shift().toLowerCase(), _this = this;
        if(this._hasDispatch(eType)) {
            var list = this._eventsList[eType];
            if (!list) {
                return this;
            }

            $.each(list, function(index, dict){
                var fn = dict.fn, scope = dict.scope || _this;
                if(!fn || "function" !== typeof fn) {
                    fn = _this._emptyFn;
                }
                if(true === scope) {
                    scope = null;
                }

                fn.apply(scope, args);
            });
        }

        return this;
    },
    
    /**
     * 订阅事件
     * @param eType 事件类型
     * @param fn 事件句柄
     * @param scope
     */
    on : function(eType, fn, scope) {
        eType = (eType || '').toLowerCase();
        if(!this._hasDispatch(eType)) {
            throw new Error("not dispatch event " + eType);
            return false;
        }

        this._eventsList[eType].push({fn : fn || null, scope : scope || null});

        return this;
    },
    
    /**
     * 取消订阅某个事件
     * @param eType 事件类型
     * @param fn 事件句柄
     */
    un : function(eType, fn) {
        eType = (eType || '').toLowerCase();
        if(this._hasDispatch(eType))
        {
            var index = this._indexFn(eType, fn);
            if(index > -1)
            {
                var list = this._eventsList[eType];
                list.splice(index, 1);
            }
        }

        return this;
    },
    
    /**
     * 取消订阅所有事件
     */
    die : function(eType) {
        eType = (eType || '').toLowerCase();
        if(this._eventsList[eType]) {
            this._eventsList[eType] = [];
        }

        return this;
    }
};
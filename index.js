;(function() {

   var
      form = document.getElementById('myForm'),
      button = document.getElementById('submitButton'),
      resCont = document.getElementById('resultContainer'),
      validators = {
         fio: function() {
            // валидатор 3 слова
            var 
               val = this.value || '';
            return !!val.match(/^\s*([A-z0-9А-яЁё_]+\s+){2}[A-z0-9А-яЁё_]+\s*$/g);
         },

         phone: function () {
            // валидатор телефона
            var
               trueSum = false,
               val = this.value && this.value.trim ? this.value.trim() : '',
               numberReg = /\+7\(\d\d\d\)\d\d\d-\d\d-\d\d/,
               trueFormat = !!val.match(numberReg);

            if (trueFormat) {
               trueSum = val.match(/\d/g).reduce( function(sum, current) {
                  sum = sum + parseInt(current, 10);
                  return sum;
               }, 0 ) <= 30;
            }

            return trueSum;
         },

         email: function() {
            // вылидатор email
            var
               val = this.value && this.value.trim ? this.value.trim() : '',
               emailReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
               allowedDomains = [
                  'ya.ru', 'yandex.ru', 'yandex.ua', 'yandex.by', 'yandex.kz', 'yandex.com'
               ],
               isEmail = !!val.match(emailReg),
               trueDomain = false;

            if (isEmail) {
               trueDomain = allowedDomains.includes(val.split('@')[1]);
            }
            return trueDomain;
         }
      };

   function _setFormActive(value) {
      var elements = form.getElementsByTagName('input');
      for (element in elements) {
         elements[element].disabled = !value;
      }
      button.disabled = !value;
   };

   function _validate () {
      var
         result = { isValid: true, errorFields: [] };
         inputs = form.querySelectorAll('input');

      inputs.forEach(function(el) {
         var
            isValidElement = false;
            validatorFunc = validators[el.getAttribute('data-validator')];

         if (validatorFunc) {
            isValidElement = validatorFunc.call(el);
            result.isValid = result.isValid && isValidElement;

            if (!isValidElement) {
               result.errorFields.push(el.id);
               el.classList.add('error');
            } else {
               el.classList.remove('error');
            }
         }
      });
      return result;
   };

   function _getData() {
      return {
         fio: form.elements['fio'].value,
         phone: form.elements['phone'].value,
         email: form.elements['email'].value
      }
   };

   function _setData(obj) {
      form.elements['fio'].value = obj['fio'] || '';
      form.elements['phone'].value = obj['phone'] || '';
      form.elements['email'].value = obj['email'] || '';
   };

   function _getParams() {
      var
         result = [],
         data = _getData();

      for (param in data) {
         result.push( param + '=' + encodeURIComponent(data[param]) );
      }

      return result.join('&');
   };

   function _responseHandler(resp, params) {
      var
         result = true,
         respObj = JSON.parse(resp),
         {status} = respObj;

         resCont.innerHTML = '';
         resCont.classList.add(status);

      switch (status) {
         case 'error':
            resCont.innerHTML = respObj.reason;
            break;
         case 'progress':
            result = false;
            setTimeout(function() {
               _submit(params);
            }, respObj['timeout'] || 5000);
            break;
         }
      return result;
   };

   function _submit(params) {
      // отправка формы
      var 
         validResult = true;
      
      // если пришли параметры - это переотправка формы. Не нужно валидировать и обновлять классы.
      if (!params) {
         validResult = _validate().isValid;
         resCont.classList.remove('success', 'error', 'progress');
         resCont.innerHTML = '';
      }

      if (validResult) {
         // форма валидна и сейчас будет делаться запрос, закрываем форму от изменений
         _setFormActive(false);
         params = params || _getParams();
         var 
            xhr = new XMLHttpRequest();
         xhr.open('POST', form.action, true);
         // в тз нет указания как передавать параметры
         // поэтому будем через POST
         xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
         xhr.send( params );
         xhr.onreadystatechange = function() {
            if (xhr.readyState !== 4) return;
            // при положительном результате откроем форму, а при отрицательном - нет
            _setFormActive(_responseHandler(xhr.responseText, params));
         }
      };
   };

   button.addEventListener('click', function(event) {
      _submit();
   })

   // выводим объект в глобальную область видимости
   window.myForm = {
      validate: _validate,
      getData: _getData,
      setData: _setData,
      submit: _submit,
      form: form
   }
})();

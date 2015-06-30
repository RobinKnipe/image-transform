/**
 * Created by robin on 19/06/15.
 */

$(function() {

    function error(err) {
        console.dir(err);
        $('#error').text(err).parent().show();
    }

    $("#upload").submit(function(event){
        event.preventDefault();

        $('#preview').css('visibility', 'visible');
        $('#result').css('visibility', 'hidden');//.removeClass('complete');
        $('progress').text('Uploading image...').attr({
            max: 100,
            value: 0
        }).css('visibility', 'visible');
        var data = new FormData($('#upload')[0]);

        $.ajax(this.action, {
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            type: 'POST',
            xhr: function() {  // custom xhr
                myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload) {
                    myXhr.upload.addEventListener('progress',
                        function(progress) {
                            $('progress').attr({
                                max: progress.total || progress.totalSize,
                                value: progress.loaded || progress.position
                            });
                        },
                        false);
                }
                return myXhr;
            },
            success: function(result) {
                $('progress').text('Image uploaded!').attr({
                    max: 200,
                    value: 200
                }).delay(1000).css('visibility', 'hidden');
                $('#edit').css('background-image', "url('"+result.preview+"')");
                $('#imagePath').val(result.preview);
            },
            error: error
        });

        return false;
    });

    $('#rotate').change(function() {
        var deg = this.value;
        $('#edit').css({
            'transform': 'rotate('+deg+'deg)',
            '-webkit-transform': 'rotate('+deg+'deg)',
            '-moz-transform': 'rotate('+deg+'deg)',
            '-ms-transform': 'rotate('+deg+'deg)'
        });
    });

    $('#crop').click(function() {
        //$('#rotate').attr('disabled', true);
        $('#content').toggleClass('cropping');
        $('.crop input[type="number"]').forEach(function () {
           this.value = 0;
        });
    });
    $('#reset').click(function() {
        //$('#rotate').attr('disabled', false);
        $('#content').removeClass('cropping');
    });

    function checkCropping() {
        var content = $('#content');
        if ($('#top').val() > 0 ||
            $('#left').val() > 0 ||
            $('#right').val() > 0 ||
            $('#bottom').val() > 0) {
            content.addClass('cropping');
        }
        else content.removeClass('cropping');
    }

    $('#top, #bottom').change(function() {
        var crop = 10 + Number(this.value);
        if (!isNaN(crop)) {
            $('.' + this.name).height(crop);
            $('.left.edge, .right.edge').css(this.name, crop + 'px');
            checkCropping();
        }
    });
    $('#left, #right').change(function() {
        var crop = 10 + Number(this.value);
        if (!isNaN(crop)) {
            $('.' + this.name).width(crop);
            $('.top.edge, .bottom.edge').css(this.name, crop + 'px');
            checkCropping();
        }
    });

    $('#transform').submit(function() {
        event.preventDefault();

        $('#editWidth').val($('#edit').width());
        $('#editHeight').val($('#edit').height());
        var left = Number($('#left').val()) || 0;
        var right = Number($('#right').val()) || 0;
        var top = Number($('#top').val()) || 0;
        var bottom = Number($('#bottom').val()) || 0;
        var previewHeight = Number($('#edit').width()) || 0;
        var previewWidth = Number($('#edit').height()) || 0;
        $('#width').val(previewWidth - (left + right));
        $('#height').val(previewHeight - (top + bottom));

        var data = $('#transform').serialize();
        $.ajax(this.action, {
            type: 'POST',
            data: data,
            cache: false,
            success: function(result) {
                $('#result').addClass('complete');
                var url = result.passport + "?_=" + new Date().getTime();
                $('#resultImg').css({ 'background-image':"url('"+url+"')", 'display':'block' });
            },
            error: error
        });

        $('#resultImg').css('display', 'none');
        $('#preview').css('visibility', 'hidden');
        $('#result').removeClass('complete').css('visibility', 'visible');

        return false;
    });

    $('#switch').click(function() {
        if ($('#preview').css('visibility') == 'hidden') {
            $('#preview').css('visibility', 'visible');
            $('#result').css('visibility', 'hidden');
        }
        else {
            $('#preview').css('visibility', 'hidden');
            $('#result').css('visibility', 'visible');
        }
    });

    $(window).resize(function() {
        var div = $('#preview>div');
        div.height(div.width());
    });
    $(window).resize();

});

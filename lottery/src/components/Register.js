import React, { useState } from 'react';
import classNames from 'classnames';
import style from './Register.module.less';

export default ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [blessings, setBlessings] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [canSubmit, setCanSubmit] = useState(false);

  const handleCanSubmit = (i1, i2, i3, i4) => {
    if (i1.length * i2.length * i3.length * i4.length !== 0) {
      setCanSubmit(true);
    } else {
      setCanSubmit(false);
    }
  };
  const handleName = e => {
    const value = e.target.value;
    setName(value);
    const trimValue = value.trim();
    if (trimValue.length === 0) setCanSubmit(false);
    handleCanSubmit(trimValue, keywords, blessings, captcha);
  };
  const handleKeywords = e => {
    const value = e.target.value;
    setKeywords(value);
    const trimValue = value.trim();
    if (trimValue.length === 0) setCanSubmit(false);
    handleCanSubmit(name, trimValue, blessings, captcha);
  };
  const handleBlessings = e => {
    const value = e.target.value;
    setBlessings(value);
    const trimValue = value.trim();
    if (trimValue.length === 0) setCanSubmit(false);
    handleCanSubmit(name, keywords, trimValue, captcha);
  };
  const handleCaptcha = e => {
    const value = e.target.value;
    setCaptcha(value);
    const trimValue = value.trim();
    if (trimValue.length === 0) setCanSubmit(false);
    handleCanSubmit(name, keywords, blessings, trimValue);
  };
  const handleSubmit = () => {
    if (canSubmit) {
      onSubmit({
        name,
        keywords,
        blessings,
        captcha,
      });
    }
  };

  return (
    <>
      <div className={style.wrapper}>
        <h2 className={style.title}>我要报名</h2>
        <input
          value={name}
          onChange={handleName}
          placeholder="少侠，请留下姓名"
        />
        <input
          value={keywords}
          onChange={handleKeywords}
          placeholder="2021关键词/Flag，如：买10个 BTC、爆瘦10斤"
        />
        <div className={style.textarea_wrapper}>
          <textarea
            value={blessings}
            onChange={handleBlessings}
            placeholder="请留下对公司的祝福语吧～"
            maxLength="180"
          />
          <div className={style.textarea_count_box}>
            <span className={style.number}>{blessings.length}</span>
            <span className={style.number_all}>/180</span>
          </div>
        </div>
        <input
          value={captcha}
          onChange={handleCaptcha}
          placeholder="查收邮件，输入唯一验证码"
        />
        <div
          className={classNames(
            style.submit,
            canSubmit ? style.can_submit : style.cannot_submit,
          )}
          role="button"
          onClick={handleSubmit}
          tabIndex={0}
        >
          确认报名
        </div>
        <div className={style.postscript}>
          * 确认报名后信息无法更改，阁下请谨慎！
        </div>
      </div>
    </>
  );
};

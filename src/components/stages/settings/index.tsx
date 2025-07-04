import { Checkbox, CheckboxProps, Form, InputNumber } from 'antd';
import { CustomButton } from "components/shared/customButton";
import { StageComponent } from "helpers/types/stage";
import { useAppDispatch } from "hooks/useAppDispatch";
import { useAppSelector } from 'hooks/useAppSelector';
import { selectGameSettings } from 'store/app/selectors';
import { setGameSettings } from 'store/app/slice';
import styles from "./styles.module.css";

export const Settings: StageComponent = ({ toNextPage }) => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectGameSettings);

  const onTimeLimitationChange: CheckboxProps['onChange'] = (e) => {
    const withTimeLimit = e.target.checked
    dispatch(setGameSettings({ timeLimit: 60, withTimeLimit }));
  };

  return (
    <div className={styles.settings}>
      <Checkbox onChange={onTimeLimitationChange} checked={settings.withTimeLimit}>Ժամանակով</Checkbox>
      {
        settings.withTimeLimit && (
          <Form.Item label="Վայրկյան">
            <InputNumber min={1} max={200} value={settings.timeLimit} onChange={(value) => dispatch(setGameSettings({ timeLimit: value ?? 0 }))} style={{ background: 'transparent' }} />
          </Form.Item>
        )
      }
      <Form.Item label="Առավելագույն Միավորների քանակ">
        <InputNumber min={1} max={999} value={settings.pointsToWin} onChange={(value) => dispatch(setGameSettings({ pointsToWin: value ?? 1 }))} style={{ background: 'transparent' }} />
      </Form.Item>
      <Form.Item label="Նվազագույն տառերի քանակ" labelAlign='right'>
        <InputNumber min={2} max={8} value={settings.minLettersCount} onChange={(value) => dispatch(setGameSettings({ minLettersCount: value ?? 3 }))} style={{ background: 'transparent' }} />
      </Form.Item>
      <CustomButton disabled={false} onClick={() => toNextPage()}>
        Սկսել խաղը
      </CustomButton>
    </div >
  );
};

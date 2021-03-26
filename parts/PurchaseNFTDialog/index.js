
import { memo, useCallback } from 'react'
import { useSelector } from 'react-redux'
import {
  Grid,
  Typography
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import * as jupiterAPI from 'services/api-jupiter'
import MagicDialog from 'components/MagicDialog'
import GradientButton from 'components/UI/Buttons/GradientButton'
import MagicTextField from 'components/UI/TextFields/MagicTextField'
import { getTimestamp } from 'utils/helpers/getTimestamp'
import usePopUp from 'utils/hooks/usePopUp'
import useLoading from 'utils/hooks/useLoading'
import {
  INTEGER_VALID,
  PASSPHRASE_VALID
} from 'utils/constants/validations'
import { NQT_WEIGHT } from 'utils/constants/common'
import MESSAGES from 'utils/constants/messages'
import { IMAGE_PLACEHOLDER_IMAGE_PATH } from 'utils/constants/image-paths';

const schema = yup.object().shape({
  quantity: INTEGER_VALID,
  deliveryDays: INTEGER_VALID,
  passphrase: PASSPHRASE_VALID
});

const useStyles = makeStyles((theme) => ({
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  image: {
    height: 150,
    maxWidth: '100%',
    objectFit: 'contain',
    borderRadius: 16,
    border: `2px solid ${theme.palette.primary.main}`,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: theme.spacing(2, 0)
  },
  button: {
    marginTop: theme.spacing(3)
  }
}));

const PurchaseNFTDialog = ({
  open,
  setOpen,
  item,
}) => {
  const classes = useStyles();
  const { setPopUp } = usePopUp();
  const { changeLoadingStatus } = useLoading();
  const { currentUser } = useSelector(state => state.auth);

  const { control, handleSubmit, errors } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = useCallback(async (data) => {
    changeLoadingStatus(true)
    try {
      let deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + data.deliveryDays)

      const params = {
        goods: item.goods,
        priceNQT: item.priceNQT,
        quantity: data.quantity,
        secretPhrase: data.passphrase,
        deliveryDeadlineTimestamp: getTimestamp(deliveryDate),
        publicKey: currentUser.publicKey,
      }

      const response = await jupiterAPI.purchaseDGSGood(params)
      if (response?.errorCode) {
        setPopUp({ text: response?.errorDescription || MESSAGES.PURCHASE_NFT_ERROR })
        changeLoadingStatus(false)
        return;
      }

      setPopUp({ text: MESSAGES.PURCHASE_NFT_SUCCESS })
      setOpen(false);
    } catch (error) {
      console.log(error)
      setPopUp({ text: MESSAGES.PURCHASE_NFT_ERROR })
    }
    changeLoadingStatus(false)
  }, [item, currentUser, setOpen, setPopUp, changeLoadingStatus]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <MagicDialog
      open={open}
      title='Purchase NFT'
      onClose={handleClose}
    >
      <form
        noValidate
        className={classes.form}
        onSubmit={handleSubmit(onSubmit)}
      >
        <img
          alt='nft image'
          src={item.description || IMAGE_PLACEHOLDER_IMAGE_PATH}
          className={classes.image}
        />
        <Typography color='primary' className={classes.title}>
          {item.name}
        </Typography>
        <Typography variant='h6' color='textPrimary'>
          {`Price: ${item.priceNQT / NQT_WEIGHT} JUP`}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller
              as={<MagicTextField />}
              name='quantity'
              label='Quantity'
              type='number'
              placeholder='Quantity'
              inputProps={{ min: 1 }}
              error={errors.quantity?.message}
              control={control}
              defaultValue={1}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              as={<MagicTextField />}
              name='deliveryDays'
              label='Delivery Days'
              type='number'
              placeholder='Delivery Days'
              inputProps={{ min: 1 }}
              error={errors.deliveryDays?.message}
              control={control}
              defaultValue={1}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              as={<MagicTextField />}
              name='passphrase'
              label='Passphrase'
              placeholder='Passphrase'
              error={errors.passphrase?.message}
              control={control}
              defaultValue=''
            />
          </Grid>
        </Grid>
        <GradientButton
          type='submit'
          className={classes.button}
        >
          Purchase Now
        </GradientButton>
      </form>
    </MagicDialog>
  );
}

export default memo(PurchaseNFTDialog)
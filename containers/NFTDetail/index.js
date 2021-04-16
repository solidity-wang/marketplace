import { memo, useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import { makeStyles } from '@material-ui/core/styles'
import { Grid } from '@material-ui/core'

import * as jupiterAPI from 'services/api-jupiter'
import NoNFT from 'parts/NoNFT'
import ImageWall from 'parts/ImageWall'
import NFTInformation from './NFTInformation'
import NFTImage from './NFTImage'
import AssetOrders from './AssetOrders'
import AssetBids from './AssetBids'
import usePopUp from 'utils/hooks/usePopUp'
import MESSAGES from 'utils/constants/messages'
import { isEmpty } from 'utils/helpers/utility'
import getJSONParse from 'utils/helpers/getJSONParse'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  container: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    maxWidth: theme.custom.layout.maxDesktopWidth,
    padding: theme.spacing(10, 3),
  },
  imageContainer: {
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: `${theme.spacing(8)}px !important`,
  },
  rightContainer: {
    display: 'flex',
    alignItems: 'center'
  },
}));

const NFTDetail = () => {
  const classes = useStyles();
  const router = useRouter();
  const { setPopUp } = usePopUp();

  const [good, setGood] = useState({})
  const assetInfo = useMemo(() => getJSONParse(good.message), [good]);

  useEffect(() => {
    const getAskOrder = async () => {
      const response = await jupiterAPI.getAskOrder(router.query.goods);
      if (response?.errorCode) {
        setPopUp({ text: MESSAGES.GET_NFT_ERROR })
        return;
      }

      setGood(response)
    }

    if (router.query.goods) {
      getAskOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query])

  console.log(good)
  return (
    <main className={classes.root}>
      <ImageWall header='NFT Token Detail' />
      <div className={classes.container}>
        {isEmpty(good)
          ? (
            <NoNFT />
          ) : (
            <Grid container spacing={5}>
              <Grid item xs={12} sm={6} md={8} className={classes.imageContainer}>
                <NFTImage good={assetInfo} />
              </Grid>
              <Grid item xs={12} sm={6} md={4} className={classes.rightContainer}>
                <NFTInformation
                  good={good}
                  assetInfo={assetInfo}
                />
              </Grid>
              <Grid item xs={12}>
                <AssetOrders good={good} />
              </Grid>
              <Grid item xs={12}>
                <AssetBids good={good} />
              </Grid>
            </Grid>
          )
        }
      </div>
    </main>
  )
}

export default memo(NFTDetail)
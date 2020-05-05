/**
 * AquesTalk ESP32
 *
 * 音声合成エンジン「AquesTalk pico」と
 * 言語処理エンジン「AqKanji2Roman-M」をESP32に移植
 *
 * ライブラリ(libaquestalk.a)のヘッダファイルである
 * 漢字テキスト(UTF8)、または、音声記号列から音声波形データを生成
 * 出力音声波形は、規定の長さ単位毎に生成
 * 声種:picoF4, 8HKzサンプリング, 16bit, モノラル
 * AqResample(3倍アップサンプリング)関数を含む
 * 漢字テキストからの場合は、辞書データ(aqdic_m.bin)とそのアクセス関数が必要
 *
 * @file		aquestalk.h
 * @copyright	2018 AQUEST Corp.
 * @attention 	AqResample(3倍アップサンプリング)関数を含む
 *            	ライセンスキーを指定しない場合はナ行マ行がヌになる評価版としての制限あり
 * @date		2018/03/18	N.Yamazaki	ESP32に移植
 * @date		2018/08/08	N.Yamazaki	言語処理追加
 */
#if !defined(_AQTK_ESP32_H_)
#define _AQTK_ESP32_H_
#ifdef __cplusplus
extern "C"{
#endif

#include <stdint.h>

/////////////////////////////////////////////
//	言語処理部 AqKanji2Roman_M
//	漢字テキスト->ローマ字音声記号列
/////////////////////////////////////////////

#define SIZE_AQK2R_MIN_WORK_BUF	(20*1024)

/////////////////////////////////////////////
//!	言語処理 初期化
//!	@return	0：正常終了 >0：ERR
int  CAqK2R_Create(uint8_t *workbuf, int sizeWorkBuf);

/////////////////////////////////////////////
//!	言語処理 終了
void CAqK2R_Release();

/////////////////////////////////////////////
//!	言語処理 変換 Unicode(UTF8) 版
//! @param	kanji[in]	漢字かな混じり文テキスト（UTF8,BOM無)
//! @param	koe[out]	ローマ字音声記号列
//! @param	nBufKoe[in]	koeのバッファサイズ(配列の要素数)
//!	@return	0:正常終了 それ以外：エラーコード
int CAqK2R_Convert(const char *kanji_utf8, char *roman, int nBufRoman);

/////////////////////////////////////////////
//!	言語処理 変換 Unicode(UTF16) 版
//! @param	kanji[in]	漢字かな混じり文テキスト（UTF16LE)
//! @param	koe[out]	ローマ字音声記号列
//! @param	nBufKoe[in]	koeのバッファサイズ(配列の要素数)
//!	@return	0:正常終了 それ以外：エラーコード
int CAqK2R_ConvertW(const char16_t *kanji, char *koe, int nBufKoe);


/////////////////////////////////////////////
//	規則合成部 AquesTalk pico
//	ローマ字音声記号列 -> 音声波形データ
/////////////////////////////////////////////
#define	AQ_SIZE_WORKBUF	100	// [x4byte]

/////////////////////////////////////////////
//!	初期化
//! @param	buf[in]	ワークバッファ。呼び出し側で確保。
//!			サイズは、AQ_SIZE_WORKBUF
//! @param	lenFrame[in] (30-320)	SyntheFrame()の呼出し毎に生成するサンプル数を指定
//! @param	key[in]	ライセンスキー文字列
//!         NULL指定で評価版制限あり。不正なキーを指定してもエラーは返さない
//!	@return	0:正常 それ以外:エラー
uint8_t CAqTkPicoF_Init(uint32_t *buf, uint16_t lenFrame, const char *key);

/////////////////////////////////////////////
//!	音声記号列をセット
//!	この関数呼出し後、SyntheFrame()を連続して呼び出して音声波形を生成する
//! @param	koe[in]	音声記号列（NULL終端）
//! 		呼出し後、解放可能。
//! @param	speed[in]	発話速度 [%] 50-300 の間で指定   slow:50 fast:300 default:100
//!			speed の値を大きく設定するほど、速くなる
//! @param	lenPause[in]	最後のポーズ長[sample]
//!			0xffffU を指定すると、内部の標準ポーズ長。(デフォルト)
//!			0で最後のポーズ長が０になる
//!	@return	0:正常 それ以外:エラー
uint8_t	CAqTkPicoF_SetKoe(const uint8_t *koe, uint16_t speed, uint16_t lenPause);

/////////////////////////////////////////////
//!	音声波形を生成
//! @param	wav[out]	音声波形出力バッファ(lenFrame X 2byte以上)
//!	                    最終フレームは *pSize<lenFrame の場合であっても残りのデータはゼロパディングされる
//!	@param	pLen[out]	生成したデータのサンプル数を返す。
//!	                    通常、最終フレーム以外はlenFrameで指定した値。
//!	@return	0:正常 1: EOD それ以外:エラー
uint8_t CAqTkPicoF_SyntheFrame(short *wav, uint16_t *pLen);


/////////////////////////////////////////////
// サンプリング周波数変換 AqResample
//
// アップサンプリング(x3)
/////////////////////////////////////////////

/////////////////////////////////////////////
//! アップサンプリング処理の内部変数の初期化 
void	AqResample_Reset();

/////////////////////////////////////////////
//! アップサンプリング処理	
//! 1サンプルを与えると3サンプルを返す
//! @param	sin[in]	音声波形の1サンプルを指定
//! @param	sout[out] 音声波形の3サンプル返す。short[3]の配列を呼び出し側で用意。
void	AqResample_Conv(short sin, short *sout);

#ifdef __cplusplus
}
#endif
#endif // !defined(_AQTK_ESP32_H_)

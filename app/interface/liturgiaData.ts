export interface Leitura {
    referencia: string;
    titulo: string;
    texto: string;
  }

  export interface SegundaLeitura {
    referencia: string;
    titulo: string;
    texto: string;
  }

  export interface Salmo {
    referencia: string;
    refrao: string;
    texto: string;
  }
  
  export interface Evangelho {
    referencia: string;
    titulo: string;
    texto: string;
  }
  
  export interface Liturgia {
    data: string;
    liturgia: string;
    cor: string;
    dia: string;
    oferendas: string;
    comunhao: string;
    primeiraLeitura: Leitura;
    segundaLeitura: SegundaLeitura;
    salmo: Salmo;
    evangelho: Evangelho;
    antifonas: {
      entrada: string;
      ofertorio: string;
      comunhao: string;
    };
  }
  
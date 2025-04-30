<?php 

namespace App\Services;

use Symfony\Component\Ldap\Ldap;

class LdapService {
    private $dn;
    private $password;
    private $host;
    public function __construct() {
        $this->dn = config('ldap.dn');
        $this->password = config('ldap.password');
        $this->host = config('ldap.host');
    }

    public function obterTodosUsersLdap(): array {
        $ldap = Ldap::create('ext_ldap', [
           'host' => $this->host,
        ]);

        $ldap->bind($this->dn, $this->password);

        $query = $ldap->query('DC=coren,DC=local', '(&(objectCategory=person)(objectClass=user)(!(userAccountControl:1.2.840.113556.1.4.803:=2))(!(userAccountControl:1.2.840.113556.1.4.803:=16))(!(userAccountControl:1.2.840.113556.1.4.803:=8388608))(!(userAccountControl:1.2.840.113556.1.4.803:=514))(!(userAccountControl:1.2.840.113556.1.4.803:=546))(!(userAccountControl:1.2.840.113556.1.4.803:=66050))(!(userAccountControl:1.2.840.113556.1.4.803:=66082))(!(sAMAccountName=*Sophos*))(!(sAMAccountName=*impr*))(!(sAMAccountName=*trein*))(!(sAMAccountName=*temporario*))(!(sAMAccountName=krbtgt))(!(sAMAccountName=globaltti))(!(sAMAccountName=*telecom*))(!(sAMAccountName=sum))(!(sAMAccountName=*sysprep*))(!(sAMAccountName=*tarefa*))(!(sAMAccountName=*appl*))(!(sAMAccountName=Elifelren))(!(sAMAccountName=Convidado))(!(sAMAccountName=*usr*))(!(sAMAccountName=*cofen*))(!(sAMAccountName=*script*))(!(sAMAccountName=*wg))(!(sAMAccountName=*teste*))(!(sAMAccountName=*0*))(!(sAMAccountName=*1*))(!(sAMAccountName=*srv*))(!(sAMAccountName=*adm*))(!(sAMAccountName=*.sup))(!(sAMAccountName=*coren*))(!(sAMAccountName=*monitor*))(!(sAMAccountName=*aprendeai*))(!(sAMAccountName=*seprol*))(!(sAMAccountName=*veeam*))(!(sAMAccountName=*sigma*))(!(sAMAccountName=*plenaria*))(!(sAMAccountName=*scanner*))(!(sAMAccountName=*alex.barbieri*))(!(sAMAccountName=*rafael.conceicao*))(!(sAMAccountName=*itscon*)))');

        $results = $query->execute();

        $resultadoFiltrado = [];
        foreach ($results as $result) {
            $samAccountName = $result->getAttribute('sAMAccountName')[0] ?? 'N/A';
            $cn = $result->getAttribute('cn')[0] ?? 'N/A';
            $description = $result->getAttribute('description')[0] ?? 'N/A';

            $resultadoFiltrado[] = [
                'sAMAccountName' => $samAccountName,
                'cn' => $cn,
                'description' => $description,
            ];
        }

        return $resultadoFiltrado;
    }
}